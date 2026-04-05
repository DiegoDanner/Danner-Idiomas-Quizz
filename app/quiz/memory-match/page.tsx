'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, Puzzle, Trophy, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuthAction } from '@/hooks/useAuthAction';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { saveQuizProgress } from '@/lib/progress';

// Master list of 30 words with emojis
const MASTER_WORDS = [
  { word: "Apples", icon: "🍎" }, { word: "Blueberries", icon: "🫐" }, { word: "Tomatoes", icon: "🍅" },
  { word: "Lettuce", icon: "🥬" }, { word: "Carrots", icon: "🥕" }, { word: "Onions", icon: "🧅" },
  { word: "Broccoli", icon: "🥦" }, { word: "Potatoes", icon: "🥔" }, { word: "Bananas", icon: "🍌" },
  { word: "Kiwis", icon: "🥝" }, { word: "Lemons", icon: "🍋" }, { word: "Oranges", icon: "🍊" },
  { word: "Oil", icon: "🫒" }, { word: "Butter", icon: "🧈" }, { word: "Mayonnaise", icon: "🥫" },
  { word: "Milk", icon: "🥛" }, { word: "Cheese", icon: "🧀" }, { word: "Yogurt", icon: "🍦" },
  { word: "Nuts", icon: "🥜" }, { word: "Chicken", icon: "🍗" }, { word: "Eggs", icon: "🥚" },
  { word: "Fish", icon: "🐟" }, { word: "Beans", icon: "🫘" }, { word: "Beef", icon: "🥩" },
  { word: "Rice", icon: "🍚" }, { word: "Noodles", icon: "🍜" }, { word: "Bread", icon: "🥖" },
  { word: "Cereal", icon: "🥣" }, { word: "Crackers", icon: "🍪" }, { word: "Pasta", icon: "🍝" }
];

interface Card {
  id: number;
  word: string;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Helper to convert PCM to WAV
function pcmToWav(pcmData: Int16Array, sampleRate: number) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + pcmData.length * bytesPerSample);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length * bytesPerSample, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 8 * bytesPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, pcmData.length * bytesPerSample, true);

  let offset = 44;
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(offset, pcmData[i], true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

export default function MemoryMatch() {
  const [step, setStep] = useState<'start' | 'game' | 'results'>('start');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const audioCache = useRef<Record<string, string>>({});
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();
  const { user } = useAuth();

  useEffect(() => {
    if (step === 'results' && user) {
      saveQuizProgress({
        quiz_id: 'memory-match',
        score: 15,
        total_questions: 15,
      });
    }
  }, [step, user]);

  const speakWord = useCallback(async (word: string) => {
    if (audioCache.current[word]) {
      const audio = new Audio(audioCache.current[word]);
      audio.play().catch(err => console.error("Audio play error:", err instanceof Error ? err.message : err));
      return;
    }

    const fallbackSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    };

    const fetchWithRetry = async (retries = 3, delay = 1000): Promise<string | null> => {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: word }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (retries > 0 && (response.status === 429 || errorData.error?.includes('quota'))) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(retries - 1, delay * 2);
          }
          throw new Error(errorData.error || 'Failed to generate audio');
        }

        const data = await response.json();
        return data.audio || null;
      } catch (error: any) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1, delay * 2);
        }
        throw error;
      }
    };

    try {
      const base64Audio = await fetchWithRetry();
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const pcm16 = new Int16Array(bytes.buffer);
        const wavBlob = pcmToWav(pcm16, 24000);
        const audioUrl = URL.createObjectURL(wavBlob);
        audioCache.current[word] = audioUrl;
        const audio = new Audio(audioUrl);
        audio.play().catch(err => console.error("Audio play error:", err instanceof Error ? err.message : err));
      } else {
        fallbackSpeak();
      }
    } catch (error) {
      console.error("TTS Error:", error instanceof Error ? error.message : error);
      fallbackSpeak();
    }
  }, []);

  const initializeGame = useCallback(() => {
    performAction(() => {
      const selectedWords = [...MASTER_WORDS].sort(() => Math.random() - 0.5).slice(0, 15);
      const pairedCards: Card[] = [...selectedWords, ...selectedWords]
        .sort(() => Math.random() - 0.5)
        .map((item, index) => ({
          id: index,
          word: item.word,
          icon: item.icon,
          isFlipped: false,
          isMatched: false,
        }));
      
      setCards(pairedCards);
      setFlippedCards([]);
      setTries(0);
      setMatches(0);
      setIsLocked(false);
      setStep('game');
    });
  }, [performAction]);

  const handleCardClick = (id: number) => {
    if (isLocked || flippedCards.includes(id) || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);
    
    speakWord(newCards[id].word);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setTries(prev => prev + 1);
      
      const [firstId, secondId] = newFlipped;
      if (cards[firstId].word === cards[secondId].word) {
        // Match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isMatched: true } 
              : card
          ));
          setMatches(prev => {
            const newMatches = prev + 1;
            if (newMatches === 15) setStep('results');
            return newMatches;
          });
          setFlippedCards([]);
          setIsLocked(false);
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isFlipped: false } 
              : card
          ));
          setFlippedCards([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#080e1a] transition-colors duration-300">
      <Navbar />
      
      <main className="pt-28 pb-20 px-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'start' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 bg-pink-400/10 rounded-3xl flex items-center justify-center">
                  <Puzzle className="w-12 h-12 text-pink-400" />
                </div>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-[#e5ebfc]">
                VOCABULARY <span className="text-pink-400">MEMORY MATCH</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12 max-w-lg mx-auto">
                Test your memory and learn food vocabulary. Click the cards to find pairs and listen to the pronunciation!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={initializeGame}
                className="bg-pink-500 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-lg shadow-pink-500/20 hover:bg-pink-600 transition-colors"
              >
                Start Game
              </motion.button>
            </motion.div>
          )}

          {step === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Stats Bar */}
              <div className="flex flex-wrap justify-between items-center bg-gray-50 dark:bg-[#121a28] p-6 rounded-2xl border border-gray-200 dark:border-[#424855]/10 shadow-sm gap-4">
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Tries</span>
                    <span className="text-2xl font-black text-pink-500">{tries}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Matches</span>
                    <span className="text-2xl font-black text-green-500">{matches} / 15</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={initializeGame}
                  className="bg-gray-200 dark:bg-[#1d2636] text-gray-700 dark:text-[#e5ebfc] px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restart
                </motion.button>
              </div>

              {/* Game Board */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="aspect-square perspective-1000 cursor-pointer"
                    onClick={() => handleCardClick(card.id)}
                  >
                    <motion.div
                      className="relative w-full h-full transition-all duration-500 preserve-3d"
                      animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                    >
                      {/* Back of Card (Visible initially) */}
                      <div 
                        className="absolute inset-0 bg-[#3b82f6] rounded-2xl border-4 border-[#1d4ed8] flex items-center justify-center shadow-lg backface-hidden"
                      >
                        <span className="text-white font-black text-2xl drop-shadow-sm">Match?</span>
                      </div>
                      
                      {/* Front of Card (Visible when flipped) */}
                      <div 
                        className={`absolute inset-0 rounded-2xl border-4 flex flex-col items-center justify-center p-2 shadow-inner transition-colors duration-300 backface-hidden rotate-y-180 ${
                          card.isMatched 
                            ? 'bg-[#4ade80] border-[#16a34a]' 
                            : 'bg-[#4b5563] border-[#374151]'
                        }`}
                      >
                        <span className="text-4xl md:text-5xl mb-2 drop-shadow-md">{card.icon}</span>
                        <span className={`text-sm md:text-base font-bold uppercase tracking-tight text-center leading-tight ${
                          card.isMatched ? 'text-[#16a34a]' : 'text-white'
                        }`}>
                          {card.word}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="mb-8 flex justify-center">
                <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-16 h-16 text-green-500" />
                </div>
              </div>
              <h2 className="font-headline text-4xl font-extrabold mb-4 text-gray-900 dark:text-[#e5ebfc]">
                Perfect Match!
              </h2>
              <div className="text-xl text-gray-600 dark:text-[#a5abbb] mb-4">
                You found all pairs in
              </div>
              <div className="text-7xl font-black text-pink-500 mb-12">
                {tries} <span className="text-2xl text-gray-400">tries</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={initializeGame}
                  className="bg-pink-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </motion.button>
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-100 dark:bg-[#121a28] text-gray-900 dark:text-[#e5ebfc] px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Menu
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
