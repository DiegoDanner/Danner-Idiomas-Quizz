'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trophy, RotateCcw, Zap, Mic, Check, X } from 'lucide-react';
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
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [lastTranscript, setLastTranscript] = useState('');
  const [streak, setStreak] = useState(0);
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();
  const { user } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);
  const isValidatingRef = useRef(false);

  // Use refs for game state to avoid stale closures in SpeechRecognition callbacks
  const stateRef = useRef({ isDark, currentColor, currentWord, step, totalQuestions, streak });

  useEffect(() => {
    stateRef.current = { isDark, currentColor, currentWord, step, totalQuestions, streak };
  }, [isDark, currentColor, currentWord, step, totalQuestions, streak]);

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
      setStreak(0);
      setTimeLeft(120); // More time for voice
      setTotalQuestions(0);
      setLastTranscript('');
      setFeedback(null);
      generateNewPair();
      setStep('game');
      startListening();
    });
  };

  const handleAnswer = useCallback((input: string) => {
    if (isValidatingRef.current) return;
    const { isDark: dark, currentColor: color, currentWord: word, totalQuestions: count } = stateRef.current;
    if (count >= 20 || feedback) return;

    const expected = dark ? color.name : word.name;
    const isCorrect = input.toLowerCase() === expected.toLowerCase();

    isValidatingRef.current = true;

    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback('correct');

      setTimeout(() => {
        setFeedback(null);
        setTotalQuestions(prev => {
          const nextCount = prev + 1;
          if (nextCount >= 20) {
            setStep('results');
            stopListening();
          } else {
            generateNewPair();
          }
          isValidatingRef.current = false;
          return nextCount;
        });
      }, 1500);
    } else {
      setStreak(0);
      setFeedback('incorrect');

      setTimeout(() => {
        setFeedback(null);
        setTotalQuestions(prev => {
          const nextCount = prev + 1;
          if (nextCount >= 20) {
            setStep('results');
            stopListening();
          } else {
            generateNewPair();
          }
          isValidatingRef.current = false;
          return nextCount;
        });
      }, 2000);
    }
  }, [generateNewPair, stopListening, feedback]);

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
        setLastTranscript(normalized);

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
  }, [step, timeLeft]);

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
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-[#e5ebfc]">
                STROOP <span className="text-blue-500">TEST</span>
              </h1>
              <div className="bg-gray-50 dark:bg-[#121a28] p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-[#424855]/10 mb-12 max-w-2xl mx-auto text-left overflow-hidden">
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-gray-900 dark:text-[#e5ebfc]">How to Play:</h3>
                <ul className="space-y-4 text-gray-600 dark:text-[#a5abbb]">
                  <li className="flex gap-3 italic text-sm sm:text-base break-words">
                    <span className="font-bold text-blue-500 shrink-0">1.</span>
                    <span>Wait for the round to load and look at the background.</span>
                  </li>
                  <li className="flex gap-3 font-bold text-base sm:text-lg break-words">
                    <span className="font-bold text-blue-500 shrink-0">2.</span>
                    <span>If background is <span className="text-gray-900 dark:text-white underline">DARK</span>: Say the <span className="text-blue-500">COLOR</span> of the text.</span>
                  </li>
                  <li className="flex gap-3 font-bold text-base sm:text-lg break-words">
                    <span className="font-bold text-blue-500 shrink-0">3.</span>
                    <span>If background is <span className="text-gray-400 underline">WHITE</span>: Say the <span className="text-blue-500">WORD</span> itself.</span>
                  </li>
                  <li className="flex gap-3 text-sm sm:text-base break-words">
                    <span className="font-bold text-blue-500 shrink-0">4.</span>
                    <span>Speak clearly or click the buttons. 20 rounds total!</span>
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
                <div className="flex flex-col items-start">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-1">PROGRESS</span>
                  <span className="text-2xl font-black text-gray-900 dark:text-[#e5ebfc]">{totalQuestions + 1} / 20</span>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-4 border-blue-500/30 flex items-center justify-center bg-blue-500/10 shadow-lg shadow-blue-500/10">
                    <span className="text-2xl font-black text-blue-500">{streak}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-1">SCORE</span>
                  <span className="text-2xl font-black text-emerald-500">{score}</span>
                </div>
              </div>

              {/* Game Area */}
              <motion.div
                animate={{
                  background: feedback === 'correct'
                    ? 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)'
                    : feedback === 'incorrect'
                    ? 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)'
                    : (isDark ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)')
                }}
                className="flex flex-col items-center justify-center py-24 rounded-[2.5rem] border border-gray-200 dark:border-[#424855]/10 shadow-2xl relative overflow-hidden min-h-[420px]"
              >
                <AnimatePresence mode="wait">
                  {feedback === 'correct' ? (
                    <motion.div
                      key="correct-feedback"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.1, opacity: 0 }}
                      className="flex flex-col items-center gap-4 text-white z-20"
                    >
                      <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-4 border-emerald-500 flex items-center justify-center shadow-xl mb-4">
                        <Check className="w-12 h-12 text-emerald-500 stroke-[4px]" />
                      </div>
                      <h3 className="text-4xl font-black uppercase tracking-widest text-emerald-500">Correct!</h3>
                    </motion.div>
                  ) : feedback === 'incorrect' ? (
                    <motion.div
                      key="incorrect-feedback"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.1, opacity: 0 }}
                      className="flex flex-col items-center gap-4 z-20"
                    >
                      <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-xl mb-4">
                        <X className="w-12 h-12 text-white stroke-[4px]" />
                      </div>
                      <h3 className="text-4xl font-black uppercase tracking-tight text-red-500 text-center">
                        Oops! It was <span className="uppercase">{isDark ? currentColor.name : currentWord.name}</span>
                      </h3>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <motion.div
                  key="word-display"
                  animate={{
                    filter: feedback ? 'blur(12px)' : 'blur(0px)',
                    opacity: feedback ? 0.3 : 1
                  }}
                  className="flex flex-col items-center"
                >
                  <div className="mb-4">
                     <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                       {isDark ? 'Say the COLOR' : 'Say the WORD'}
                     </span>
                  </div>

                  <h2
                    className={`text-7xl md:text-9xl font-black uppercase tracking-tighter ${currentColor.class} drop-shadow-sm select-none ${!isDark && currentColor.name === 'Yellow' ? 'text-amber-600' : ''}`}
                  >
                    {currentWord.name}
                  </h2>
                </motion.div>
              </motion.div>

              {/* Voice Interaction Status */}
              <div className="flex flex-col items-center gap-8">
                <div className="bg-gray-50 dark:bg-[#121a28] px-10 py-5 rounded-full border border-gray-200 dark:border-[#424855]/10 shadow-lg flex items-center gap-5 min-w-[340px] justify-between group hover:border-blue-500/30 transition-colors">
                  <span className="text-gray-700 dark:text-[#e5ebfc] font-black tracking-wide uppercase text-sm">
                    {isListening ? (isDark ? 'Listening for color...' : 'Listening for word...') : 'Voice Active'}
                  </span>

                  <div className="flex items-center gap-3">
                    {isListening && (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1.2, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      />
                    )}
                    <Mic className={`w-6 h-6 ${isListening ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                </div>

                <div className="h-10">
                  <AnimatePresence mode="wait">
                    {lastTranscript && (
                      <motion.p
                        key={lastTranscript}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-3xl font-bold text-gray-400/80 tracking-tight"
                      >
                        &quot;{lastTranscript}&quot;
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
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
