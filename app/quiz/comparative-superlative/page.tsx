'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, CheckCircle2, XCircle, RotateCcw, ArrowRight, ArrowLeftRight, Trophy } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TTSButton from '@/components/TTSButton';
import { useAuthAction } from '@/hooks/useAuthAction';
import AuthModal from '@/components/AuthModal';
import { saveQuizProgress } from '@/lib/progress';

interface Answer {
  text: string;
  correct: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
}

const QUESTIONS: Question[] = [
  {
    question: "What is the comparative form of the adjective 'big'?",
    answers: [
      { text: "Bigger", correct: true },
      { text: "More big", correct: false },
      { text: "Biger", correct: false },
      { text: "Biggest", correct: false },
    ],
  },
  {
    question: "Which adjective is the superlative form of 'good'?",
    answers: [
      { text: "Goodest", correct: false },
      { text: "Better", correct: false },
      { text: "Best", correct: true },
      { text: "More good", correct: false },
    ],
  },
  {
    question: "How do you make the comparative form of 'expensive'?",
    answers: [
      { text: "Expensiver", correct: false },
      { text: "More expensive", correct: true },
      { text: "Expensivest", correct: false },
      { text: "Most expensive", correct: false },
    ],
  },
  {
    question: "What is the superlative form of 'happy'?",
    answers: [
      { text: "Happiest", correct: true },
      { text: "Happyest", correct: false },
      { text: "Most happy", correct: false },
      { text: "Happier", correct: false },
    ],
  },
  {
    question: "Which one-syllable adjective should use 'more' for its comparative form?",
    answers: [
      { text: "Tall", correct: false },
      { text: "Cold", correct: false },
      { text: "Fun", correct: true },
      { text: "Wet", correct: false },
    ],
  },
  {
    question: "What is the comparative form of 'bad'?",
    answers: [
      { text: "Badder", correct: false },
      { text: "More bad", correct: false },
      { text: "Worse", correct: true },
      { text: "Worst", correct: false },
    ],
  },
  {
    question: "How do you correctly write the superlative form of 'simple'?",
    answers: [
      { text: "Simpler", correct: false },
      { text: "Most simple", correct: false },
      { text: "Simplest", correct: true },
      { text: "More simple", correct: false },
    ],
  },
  {
    question: "What is the comparative form of 'beautiful'?",
    answers: [
      { text: "Beautifuller", correct: false },
      { text: "More beautiful", correct: true },
      { text: "Beautifuler", correct: false },
      { text: "Most beautiful", correct: false },
    ],
  },
  {
    question: "What is the superlative form of 'clean'?",
    answers: [
      { text: "Cleanest", correct: true },
      { text: "Most clean", correct: false },
      { text: "Cleaner", correct: false },
      { text: "More clean", correct: false },
    ],
  },
  {
    question: "My soup is hot, but yours is even ___.",
    answers: [
      { text: "Hotter", correct: true },
      { text: "More hot", correct: false },
      { text: "Hottest", correct: false },
      { text: "Most hot", correct: false },
    ],
  },
  {
    question: "What is the superlative form of 'dry'?",
    answers: [
      { text: "Dryest", correct: false },
      { text: "Most dry", correct: false },
      { text: "Driest", correct: true },
      { text: "Drier", correct: false },
    ],
  },
  {
    question: "An elephant is ___ than a mouse.",
    answers: [
      { text: "Larger", correct: true },
      { text: "More large", correct: false },
      { text: "Largest", correct: false },
      { text: "Most large", correct: false },
    ],
  },
  {
    question: "Which is the correct superlative form of 'wrong'?",
    answers: [
      { text: "Wrongest", correct: false },
      { text: "Most wrong", correct: true },
      { text: "Wronger", correct: false },
      { text: "More wrong", correct: false },
    ],
  },
  {
    question: "You should be ___ when you drive in the rain.",
    answers: [
      { text: "Carefuler", correct: false },
      { text: "Careful", correct: false },
      { text: "More careful", correct: true },
      { text: "Most careful", correct: false },
    ],
  },
  {
    question: "She is the ___ person in our class.",
    answers: [
      { text: "Cleverest", correct: true },
      { text: "Most clever", correct: false },
      { text: "Cleverer", correct: false },
      { text: "More clever", correct: false },
    ],
  },
  {
    question: "This street is ___ than the main road.",
    answers: [
      { text: "Narrower", correct: true },
      { text: "More narrow", correct: false },
      { text: "Narrowest", correct: false },
      { text: "Most narrow", correct: false },
    ],
  },
  {
    question: "What is the comparative form of 'dirty'?",
    answers: [
      { text: "More dirty", correct: false },
      { text: "Dirtier", correct: true },
      { text: "Dirtyer", correct: false },
      { text: "Dirtiest", correct: false },
    ],
  },
  {
    question: "What is the superlative form of 'intelligent'?",
    answers: [
      { text: "Intelligenter", correct: false },
      { text: "Intelligentest", correct: false },
      { text: "More intelligent", correct: false },
      { text: "Most intelligent", correct: true },
    ],
  },
  {
    question: "The airport is ___ away than the train station.",
    answers: [
      { text: "Farther", correct: true },
      { text: "Farrer", correct: false },
      { text: "Most far", correct: false },
      { text: "More far", correct: false },
    ],
  },
  {
    question: "This is the ___ of my worries.",
    answers: [
      { text: "Littlest", correct: false },
      { text: "Less", correct: false },
      { text: "Least", correct: true },
      { text: "Little", correct: false },
    ],
  },
];

export default function ComparativeQuiz() {
  const [step, setStep] = useState<'start' | 'quiz' | 'results'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();

  useEffect(() => {
    if (step === 'results') {
      saveQuizProgress({
        quiz_id: 'comparative-superlative',
        score: score,
        total_questions: shuffledQuestions.length
      });
    }
  }, [step, score, shuffledQuestions.length]);

  const startQuiz = () => {
    performAction(() => {
      // Shuffle and pick a subset or all. Let's pick 15 for a good session length.
      const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 15);
      setShuffledQuestions(shuffled);
      setStep('quiz');
      setCurrentIndex(0);
      setScore(0);
      setTimeLeft(20);
      setSelectedAnswer(null);
      setIsAnswered(false);
    });
  };

  const handleNext = useCallback(() => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(20);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setStep('results');
    }
  }, [currentIndex, shuffledQuestions.length]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'quiz' && !isAnswered && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      const timerId = setTimeout(() => {
        setIsAnswered(true);
      }, 0);
      return () => clearTimeout(timerId);
    }
    return () => clearInterval(timer);
  }, [step, isAnswered, timeLeft]);

  const handleAnswerClick = (index: number, isCorrect: boolean) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (isCorrect) setScore(prev => prev + 1);
  };

  const currentQuestion = shuffledQuestions[currentIndex];

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
                <div className="w-24 h-24 bg-amber-400/10 rounded-3xl flex items-center justify-center">
                  <ArrowLeftRight className="w-12 h-12 text-amber-400" />
                </div>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-[#e5ebfc]">
                COMPARATIVE & <span className="text-amber-400">SUPERLATIVE</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12 max-w-lg mx-auto">
                Test your knowledge of adjective forms. You&apos;ll have 20 seconds for each question. Good luck!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startQuiz}
                className="bg-amber-400 text-[#422006] px-12 py-5 rounded-2xl font-bold text-xl shadow-lg shadow-amber-400/20 hover:bg-amber-500 transition-colors"
              >
                Start Quiz
              </motion.button>
            </motion.div>
          )}

          {step === 'quiz' && currentQuestion && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Header Info */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-gray-600 dark:text-[#a5abbb] font-medium">
                  <span className="bg-gray-100 dark:bg-[#121a28] px-4 py-2 rounded-lg border border-gray-200 dark:border-[#424855]/20">
                    Question {currentIndex + 1} / {shuffledQuestions.length}
                  </span>
                </div>
                <div className={`flex items-center gap-2 font-bold text-lg ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                  <Timer className="w-6 h-6" />
                  {timeLeft}s
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-gray-100 dark:bg-[#121a28] rounded-full overflow-hidden border border-gray-200 dark:border-[#424855]/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` }}
                  className="h-full bg-amber-400"
                />
              </div>

              {/* Question */}
              <div className="bg-gray-50 dark:bg-[#121a28] p-8 rounded-3xl border border-gray-200 dark:border-[#424855]/10 shadow-sm relative group">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="font-headline text-2xl md:text-3xl font-bold text-gray-900 dark:text-[#e5ebfc] leading-tight flex-1">
                    {currentQuestion.question}
                  </h2>
                  <TTSButton text={currentQuestion.question.replace(/___/g, '...')} className="mt-1" />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.answers.map((answer, idx) => {
                  let statusClass = "bg-gray-50 dark:bg-[#121a28] border-gray-200 dark:border-[#424855]/10 hover:bg-white dark:hover:bg-[#1d2636]";
                  if (isAnswered) {
                    if (answer.correct) {
                      statusClass = "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400";
                    } else if (selectedAnswer === idx) {
                      statusClass = "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400";
                    } else {
                      statusClass = "opacity-50 bg-gray-50 dark:bg-[#121a28] border-gray-200 dark:border-[#424855]/10";
                    }
                  }

                  return (
                    <motion.button
                      key={idx}
                      whileHover={!isAnswered ? { y: -2, scale: 1.02 } : {}}
                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswerClick(idx, answer.correct)}
                      disabled={isAnswered}
                      className={`p-6 rounded-2xl border-2 text-left font-bold text-lg transition-all duration-300 flex justify-between items-center ${statusClass}`}
                    >
                      <span>{answer.text}</span>
                      <div className="flex items-center gap-2">
                        {isAnswered && answer.correct && (
                          <>
                            <TTSButton 
                              text={currentQuestion.question.includes('___') 
                                ? currentQuestion.question.replace(/___/g, answer.text)
                                : answer.text} 
                              className="mr-2" 
                            />
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          </>
                        )}
                        {isAnswered && !answer.correct && selectedAnswer === idx && <XCircle className="w-6 h-6 text-red-500" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback Message */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className={`text-xl font-bold ${selectedAnswer !== null && currentQuestion.answers[selectedAnswer].correct ? 'text-green-500' : 'text-red-500'}`}>
                      {selectedAnswer !== null && currentQuestion.answers[selectedAnswer].correct ? 'Correct!' : timeLeft === 0 ? "Time's up!" : 'Wrong!'}
                    </div>
                    <button
                      onClick={handleNext}
                      className="bg-amber-400 text-[#422006] px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-500 transition-colors"
                    >
                      {currentIndex === shuffledQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
                <div className="w-32 h-32 bg-amber-400/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-16 h-16 text-amber-400" />
                </div>
              </div>
              <h2 className="font-headline text-4xl font-extrabold mb-4 text-gray-900 dark:text-[#e5ebfc]">
                Quiz Complete!
              </h2>
              <div className="text-7xl font-black text-amber-400 mb-6">
                {score} / {shuffledQuestions.length}
              </div>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12">
                {score === shuffledQuestions.length 
                  ? "Perfect score! You're a grammar master!" 
                  : score >= shuffledQuestions.length * 0.75 
                  ? "Great job! You really know your adjectives." 
                  : score >= shuffledQuestions.length * 0.5 
                  ? "Not bad! A solid effort." 
                  : "Better luck next time! Keep practicing."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="bg-amber-400 text-[#422006] px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
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
