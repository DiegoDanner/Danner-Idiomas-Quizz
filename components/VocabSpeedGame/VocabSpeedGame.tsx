'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  RotateCcw,
  Trophy,
  Timer,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ArrowRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { CATEGORIES, Category } from '@/lib/vocab-speed-game-data';
import confetti from 'canvas-confetti';

// Speech Recognition Types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(idx: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(idx: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (ev: SpeechRecognitionEvent) => void;
  onerror: (ev: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const DEFAULT_DURATION = 20; // seconds
const EXTENDED_DURATION = 30; // seconds
const SUPER_EXTENDED_DURATION = 40; // seconds

const getGameDuration = (wordCount: number) => {
  if (wordCount >= 50) return SUPER_EXTENDED_DURATION;
  if (wordCount > 20) return EXTENDED_DURATION;
  return DEFAULT_DURATION;
};

export default function VocabSpeedGame() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastRecognizedWord, setLastRecognizedWord] = useState<{ word: string; status: 'correct' | 'duplicate' | 'invalid' } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        return 'Speech recognition is not supported in this browser. Please try Chrome or Safari.';
      }
    }
    return null;
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef<number>(0);
  const usedWordsRef = useRef<Set<string>>(new Set());
  const selectedCategoryRef = useRef<Category | null>(null);

  const stopGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setGameState('finished');
    if (scoreRef.current > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, []);

  const processWords = useCallback((transcript: string, isFinal: boolean) => {
    const category = selectedCategoryRef.current;
    if (!category) return;

    let newWordsFound = false;
    let cleanTranscript = transcript.toLowerCase();

    // Sort category words by length DESC so 'ice cream' matches before 'ice' or 'cream' (if present)
    const sortedCategoryWords = [...category.words].sort((a, b) => b.length - a.length);

    sortedCategoryWords.forEach(categoryWord => {
      // Escape potential regex special characters in category word just in case
      const escapedCategoryWord = categoryWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match the full word/phrase with word boundaries
      const regex = new RegExp(`\\b${escapedCategoryWord}\\b`, 'i');

      if (regex.test(cleanTranscript)) {
        if (!usedWordsRef.current.has(categoryWord)) {
          usedWordsRef.current.add(categoryWord);
          newWordsFound = true;

          scoreRef.current += 1;
          setScore(scoreRef.current);

          setLastRecognizedWord({ word: categoryWord, status: 'correct' });
          setTimeout(() => setLastRecognizedWord(null), 1500);

          // Auto-finish if all words in category are found
          if (scoreRef.current === category.words.length) {
            setTimeout(() => {
              stopGame();
            }, 1000);
          }
        } else if (isFinal) {
          // If already found and this is a new final burst, mark as duplicate visually
          setLastRecognizedWord({ word: categoryWord, status: 'duplicate' });
          setTimeout(() => setLastRecognizedWord(null), 1500);
        }

        // Remove the matched phrase from transcript so its individual pieces don't get processed as invalid later
        cleanTranscript = cleanTranscript.replace(regex, '');
      }
    });

    if (newWordsFound) {
      setUsedWords(new Set(usedWordsRef.current));
    }
  }, [stopGame]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
    let cleanupCalled = false;

    if (SpeechRecognition && gameState === 'playing') {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          const isFinal = event.results[i].isFinal;

          processWords(transcript, isFinal);

          if (!isFinal) {
            interimTranscript += transcript + ' ';
          }
        }
        setCurrentTranscript(interimTranscript);
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'no-speech' || e.error === 'aborted') {
          return;
        }

        console.error('Speech recognition error', e.error);
        if (e.error === 'not-allowed') {
          setError('Microphone access denied. Please enable it in your browser settings.');
        } else {
          setError(`Error: ${e.error}`);
        }
        stopGame();
      };

      recognition.onend = () => {
        if (!cleanupCalled && gameState === 'playing') {
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition', e);
          }
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start recognition', e);
      }
    }

    return () => {
      cleanupCalled = true;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [gameState, processWords, stopGame]);

  const startGame = (category: Category) => {
    const gameTime = getGameDuration(category.words.length);

    setSelectedCategory(category);
    selectedCategoryRef.current = category;

    setScore(0);
    scoreRef.current = 0;

    setTimeLeft(gameTime);

    setUsedWords(new Set());
    usedWordsRef.current = new Set();

    setGameState('playing');
    setIsListening(true);
    setError(null);
    setCurrentTranscript('');

    // Start Timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetToMenu = () => {
    setGameState('menu');
    setSelectedCategory(null);
    setScore(0);
    setError(null);
  };

  if (gameState === 'menu') {
    const CARD_THEMES = [
      { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-500 dark:text-blue-400', hover: 'hover:border-blue-300 dark:hover:border-blue-700' },
      { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-500 dark:text-emerald-400', hover: 'hover:border-emerald-300 dark:hover:border-emerald-700' },
      { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-500 dark:text-purple-400', hover: 'hover:border-purple-300 dark:hover:border-purple-700' },
      { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-500 dark:text-rose-400', hover: 'hover:border-rose-300 dark:hover:border-rose-700' },
      { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-500 dark:text-amber-400', hover: 'hover:border-amber-300 dark:hover:border-amber-700' },
      { bg: 'bg-teal-50 dark:bg-teal-900/20', text: 'text-teal-500 dark:text-teal-400', hover: 'hover:border-teal-300 dark:hover:border-teal-700' },
    ];

    return (
      <div className="min-h-screen font-headline pb-20">
        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-14 text-center">
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-[#e5ebfc] tracking-tight mb-5 leading-tight">
                Rapid Fire <span className="text-[#6cb2ff]">Speaking</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-[#a5abbb] max-w-3xl mx-auto leading-relaxed font-medium">
                Improve your fluency and vocabulary recall. Choose a category and say as many words as you can before the time runs out!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {CATEGORIES.map((category, i) => {
                const theme = CARD_THEMES[i % CARD_THEMES.length];
                const actionTexts = ["Start Module", "Practice Now", "Begin Quiz"];
                const actionText = actionTexts[i % actionTexts.length];

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card
                      className={`h-full border border-gray-200 dark:border-[#424855]/20 shadow-sm hover:shadow-xl dark:hover:shadow-[#6cb2ff]/10 transition-all duration-300 cursor-pointer rounded-3xl overflow-hidden group ${theme.hover}`}
                      onClick={() => startGame(category)}
                    >
                      <CardContent className="p-8 flex flex-col h-full bg-white dark:bg-[#121a28]">
                        <div className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-3xl mb-8 transition-transform group-hover:rotate-12 ${theme.bg}`}>
                          {category.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-[#e5ebfc] mb-3">{category.name}</h3>
                        <p className="text-gray-600 dark:text-[#a5abbb] text-[15px] leading-relaxed mb-10 flex-grow font-medium">
                          {category.description}
                        </p>
                        <div className={`flex items-center text-sm font-bold transition-transform group-hover:translate-x-1 ${theme.text}`}>
                          {actionText} <ArrowRight className="w-5 h-5 ml-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {error && (
              <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 max-w-xl shadow-sm border border-red-100 dark:border-red-900/30">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div className="max-w-2xl mx-auto p-6 flex flex-col items-center justify-center min-h-[80vh] space-y-8 font-headline">
        <div className="w-full flex justify-between items-center mb-4">
          <Button variant="ghost" onClick={resetToMenu} className="gap-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
            <ChevronLeft className="w-4 h-4" /> Cancel
          </Button>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
              <Timer className="w-5 h-5 text-[#6cb2ff]" />
              <span className="font-mono text-xl font-bold text-gray-900 dark:text-white">{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-2 bg-[#6cb2ff]/10 px-4 py-2 rounded-full border border-[#6cb2ff]/20">
              <Trophy className="w-5 h-5 text-[#6cb2ff]" />
              <span className="font-bold text-xl text-[#6cb2ff]">{score} / {selectedCategory?.words.length}</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <span className="text-6xl block mb-4">{selectedCategory?.icon}</span>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{selectedCategory?.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">Keep speaking!</p>
        </div>

        <div className="relative w-full aspect-square max-w-[300px] flex items-center justify-center">
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-[#6cb2ff]/20 rounded-full"
              />
            )}
          </AnimatePresence>

          <div className={`z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-xl transition-colors duration-500 ${isListening ? 'bg-[#6cb2ff] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
            {isListening ? <Mic className="w-16 h-16 animate-pulse" /> : <MicOff className="w-16 h-16" />}
          </div>

          <AnimatePresence mode="popLayout">
            {lastRecognizedWord && (
              <motion.div
                key={`${lastRecognizedWord.word}-${lastRecognizedWord.status}`}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -100, scale: 1.2 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
              >
                <Badge
                  variant={lastRecognizedWord.status === 'correct' ? 'default' : 'destructive'}
                  className={`text-lg px-4 py-2 shadow-lg border-none ${lastRecognizedWord.status === 'duplicate' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                >
                  {lastRecognizedWord.status === 'correct' && <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {lastRecognizedWord.status === 'duplicate' && <AlertCircle className="w-4 h-4 mr-2" />}
                  {lastRecognizedWord.status === 'invalid' && <XCircle className="w-4 h-4 mr-2" />}
                  {lastRecognizedWord.word}
                  {lastRecognizedWord.status === 'duplicate' && " (Already used)"}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full space-y-4">
          <Progress value={(timeLeft / (selectedCategory ? getGameDuration(selectedCategory.words.length) : DEFAULT_DURATION)) * 100} className="h-3" />

          <Card className="bg-gray-50 dark:bg-gray-800/30 border-none">
            <CardContent className="p-4 text-center min-h-[60px] flex items-center justify-center">
              <p className="text-xl font-medium italic text-gray-500 dark:text-gray-400">
                {currentTranscript || "Listening for your voice..."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <Button
            size="lg"
            onClick={stopGame}
            className="w-full max-w-xs rounded-full h-14 text-lg font-bold shadow-lg"
          >
            I&apos;m Done Speaking
          </Button>

          <div className="flex flex-wrap justify-center gap-2 max-h-[250px] overflow-y-auto p-2 w-full">
            {selectedCategory?.words.map(word => {
              const isUsed = usedWords.has(word);
              return (
                <motion.div key={word} initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout>
                  <Badge
                    variant={isUsed ? "default" : "outline"}
                    className={`text-sm px-3 py-1 transition-all duration-300 ${isUsed ? 'bg-emerald-500 hover:bg-emerald-600 scale-110 shadow-md border-none' : 'opacity-40 dark:opacity-20 hover:opacity-70 dark:hover:opacity-40 dark:text-gray-400'}`}
                  >
                    {word}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const totalPossible = selectedCategory?.words.length || 0;
    const percentage = Math.round((score / totalPossible) * 100);
    const missedWords = selectedCategory?.words.filter(w => !usedWords.has(w)) || [];

    return (
      <div className="max-w-2xl mx-auto p-6 space-y-8 font-headline">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="inline-block p-6 bg-[#6cb2ff]/10 rounded-full mb-4 border border-[#6cb2ff]/20">
            <Trophy className="w-20 h-20 text-[#6cb2ff]" />
          </div>
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white">Great Job!</h2>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Score</p>
              <p className="text-4xl font-black text-gray-900 dark:text-white">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Accuracy</p>
              <p className="text-4xl font-black text-gray-900 dark:text-white">{percentage}%</p>
            </div>
            {percentage === 100 && (
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold">Time Left</p>
                <p className="text-4xl font-black text-emerald-500">{timeLeft}s</p>
              </div>
            )}
          </div>
        </motion.div>

        <Card className="dark:bg-[#121a28] dark:border-[#424855]/20">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Results Summary</CardTitle>
            <CardDescription>Category: {selectedCategory?.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Words You Said
              </h4>
              <div className="flex flex-wrap gap-2">
                {Array.from(usedWords).map(word => (
                  <Badge key={word} variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    {word}
                  </Badge>
                ))}
                {usedWords.size === 0 && <p className="text-gray-500 dark:text-gray-400 text-sm italic">No words detected.</p>}
              </div>
            </div>

            {missedWords.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                  <AlertCircle className="w-4 h-4 text-gray-400" /> Words You Missed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {missedWords.slice(0, 15).map(word => (
                    <Badge key={word} variant="outline" className="opacity-60 dark:opacity-40 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800">
                      {word}
                    </Badge>
                  ))}
                  {missedWords.length > 15 && <span className="text-sm text-gray-500 dark:text-gray-400">and {missedWords.length - 15} more...</span>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button className="flex-1 h-12 text-lg" onClick={() => selectedCategory && startGame(selectedCategory)}>
            <RotateCcw className="w-5 h-5 mr-2" /> Try Again
          </Button>
          <Button variant="outline" className="flex-1 h-12 text-lg" onClick={resetToMenu}>
            Choose Another Category
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
