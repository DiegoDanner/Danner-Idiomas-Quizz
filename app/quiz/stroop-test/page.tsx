'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Timer, Trophy, RotateCcw, Zap } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuthAction } from '@/hooks/useAuthAction';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { saveQuizProgress } from '@/lib/progress';

const COLORS = [
  { name: 'Red', class: 'text-red-500', bg: 'bg-red-500' },
  { name: 'Blue', class: 'text-blue-500', bg: 'bg-blue-500' },
  { name: 'Green', class: 'text-green-500', bg: 'bg-green-500' },
  { name: 'Yellow', class: 'text-yellow-500', bg: 'bg-yellow-500' },
  { name: 'Orange', class: 'text-orange-500', bg: 'bg-orange-500' },
  { name: 'Purple', class: 'text-purple-500', bg: 'bg-purple-500' },
];

export default function StroopTest() {
  const [step, setStep] = useState<'start' | 'game' | 'results'>('start');
  const [currentWord, setCurrentWord] = useState(COLORS[0]);
  const [currentColor, setCurrentColor] = useState(COLORS[1]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();
  const { user } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Use refs for game state to avoid stale closures in SpeechRecognition callbacks
  const stateRef = useRef({ isDark, currentColor, currentWord, step, totalQuestions });

  useEffect(() => {
    stateRef.current = { isDark, currentColor, currentWord, step, totalQuestions };
  }, [isDark, currentColor, currentWord, step, totalQuestions]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  }, []);

  const generateNewPair = useCallback(() => {
    const wordIndex = Math.floor(Math.random() * COLORS.length);
    let colorIndex = Math.floor(Math.random() * COLORS.length);

    // Ensure word and color are different for the Stroop effect
    while (colorIndex === wordIndex) {
      colorIndex = Math.floor(Math.random() * COLORS.length);
    }

    setCurrentWord(COLORS[wordIndex]);
    setCurrentColor(COLORS[colorIndex]);
    setIsDark(Math.random() > 0.5);
  }, []);

  const startGame = () => {
    performAction(() => {
      setScore(0);
      setTimeLeft(60); // Give more time for 20 voice rounds
      setTotalQuestions(0);
      generateNewPair();
      setStep('game');
      startListening();
    });
  };

  const handleAnswer = useCallback((input: string) => {
    const { isDark: dark, currentColor: color, currentWord: word } = stateRef.current;

    setTotalQuestions(prev => {
      const nextCount = prev + 1;

      const expected = dark ? color.name : word.name;
      if (input.toLowerCase() === expected.toLowerCase()) {
        setScore(s => s + 1);
      }

      if (nextCount >= 20) {
        setStep('results');
        stopListening();
      } else {
        generateNewPair();
      }
      return nextCount;
    });
  }, [generateNewPair, stopListening]);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const normalized = transcript.trim().toLowerCase();

        // Find if normalized input matches any color name
        const matchedColor = COLORS.find(c => normalized.includes(c.name.toLowerCase()));
        if (matchedColor) {
          handleAnswer(matchedColor.name);
        }
      };

      recognition.onend = () => {
        const { step: currentStep, totalQuestions: currentCount } = stateRef.current;
        if (currentStep === 'game' && currentCount < 20) {
          try {
            recognition.start();
          } catch {}
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Speech recognition error:", error);
    }
  }, [handleAnswer]);

  useEffect(() => {
    if (step === 'game' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setStep('results');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  useEffect(() => {
    if (step === 'results' && user) {
      saveQuizProgress({
        quiz_id: 'stroop-test',
        score: score,
        total_questions: totalQuestions,
      });
    }
  }, [step, user, score, totalQuestions]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#080e1a] transition-colors duration-300">
      <Navbar />

      <main className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
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
                <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center">
                  <Zap className="w-12 h-12 text-blue-500" />
                </div>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-[#e5ebfc]">
                STROOP <span className="text-blue-500">TEST</span>
              </h1>
              <div className="bg-gray-50 dark:bg-[#121a28] p-8 rounded-2xl border border-gray-200 dark:border-[#424855]/10 mb-12 max-w-2xl mx-auto text-left">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-[#e5ebfc]">How to Play:</h3>
                <ul className="space-y-4 text-gray-600 dark:text-[#a5abbb]">
                  <li className="flex gap-3 italic">
                    <span className="font-bold text-blue-500">1.</span>
                    Wait for the round to load and look at the background.
                  </li>
                  <li className="flex gap-3 font-bold text-lg">
                    <span className="font-bold text-blue-500">2.</span>
                    If background is <span className="text-gray-900 dark:text-white underline">DARK</span>: Say the <span className="text-blue-500">COLOR</span> of the text.
                  </li>
                  <li className="flex gap-3 font-bold text-lg">
                    <span className="font-bold text-blue-500">3.</span>
                    If background is <span className="text-gray-400 underline">WHITE</span>: Say the <span className="text-blue-500">WORD</span> itself.
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-500">4.</span>
                    Speak clearly or click the buttons. 20 rounds total!
                  </li>
                </ul>
                <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
                  <div className="text-2xl">💡</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    <p>Dark background + <span className="text-red-500 font-black">BLUE</span> → Say &quot;Red&quot;</p>
                    <p>White background + <span className="text-red-500 font-black">BLUE</span> → Say &quot;Blue&quot;</p>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="bg-blue-500 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-colors"
              >
                Start Challenge
              </motion.button>
            </motion.div>
          )}

          {step === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {/* Stats Bar */}
              <div className="flex justify-between items-center bg-gray-50 dark:bg-[#121a28] p-6 rounded-2xl border border-gray-200 dark:border-[#424855]/10 shadow-sm">
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Score</span>
                    <span className="text-3xl font-black text-blue-500">{score}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Round</span>
                    <span className="text-3xl font-black text-blue-500">{totalQuestions + 1} / 20</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Time Left</span>
                  <div className={`flex items-center gap-2 text-3xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-900 dark:text-[#e5ebfc]'}`}>
                    <Timer className="w-6 h-6" />
                    {timeLeft}s
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-100 dark:bg-[#121a28] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: `${(timeLeft / 60) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                  className={`h-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-blue-500'}`}
                />
              </div>

              {/* Game Area */}
              <motion.div
                animate={{ backgroundColor: isDark ? '#080e1a' : '#ffffff' }}
                className="flex flex-col items-center justify-center py-16 rounded-3xl border border-gray-200 dark:border-[#424855]/10 shadow-inner relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {isListening && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-4 right-6 flex items-center gap-2"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Listening</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute top-4 left-6">
                   <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                     {isDark ? 'Say the COLOR' : 'Say the WORD'}
                   </span>
                </div>

                <motion.h2
                  key={currentWord.name + currentColor.name + isDark}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`text-7xl md:text-9xl font-black uppercase tracking-tighter ${currentColor.class} drop-shadow-sm select-none`}
                >
                  {currentWord.name}
                </motion.h2>
              </motion.div>

              {/* Controls */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {COLORS.map((color) => (
                  <motion.button
                    key={color.name}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(color.name)}
                    className="bg-gray-50 dark:bg-[#121a28] border-2 border-gray-200 dark:border-[#424855]/10 p-6 rounded-2xl font-bold text-xl text-gray-900 dark:text-[#e5ebfc] hover:bg-white dark:hover:bg-[#1d2636] transition-all flex items-center justify-center gap-3 group"
                  >
                    <div className={`w-4 h-4 rounded-full ${color.bg} group-hover:scale-125 transition-transform`} />
                    {color.name}
                  </motion.button>
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
                Challenge Over!
              </h2>
              <div className="text-xl text-gray-600 dark:text-[#a5abbb] mb-4">
                Your final score
              </div>
              <div className="text-8xl font-black text-blue-500 mb-2">
                {score}
              </div>
              <div className="text-gray-400 font-bold mb-12">
                {totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0}% accuracy
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="bg-blue-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
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
