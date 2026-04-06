'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, CheckCircle2, XCircle, RotateCcw, ArrowRight, Lightbulb, Zap } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TTSButton from '@/components/TTSButton';
import { saveQuizProgress } from '@/lib/progress';
import { useAuthAction } from '@/hooks/useAuthAction';
import AuthModal from '@/components/AuthModal';

interface Option {
  text: string;
  rationale: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  answerOptions: Option[];
  hint: string;
  category: string;
}

const DAILY_BLITZ_DATA: Question[] = [
  {
    category: "Grammar",
    question: "Which sentence is correct?",
    answerOptions: [
      { text: "She don't like coffee.", rationale: "Incorrect auxiliary for third person singular.", isCorrect: false },
      { text: "She doesn't likes coffee.", rationale: "After 'doesn't', the verb should be in base form.", isCorrect: false },
      { text: "She doesn't like coffee.", rationale: "Correct use of 'doesn't' + base verb for third person singular.", isCorrect: true },
      { text: "She not like coffee.", rationale: "Missing auxiliary verb 'does'.", isCorrect: false },
    ],
    hint: "Think about the third person singular (he/she/it) in negative present tense."
  },
  {
    category: "Verb To Be",
    question: "They ____ very happy about the news yesterday.",
    answerOptions: [
      { text: "are", rationale: "This is present tense, but the sentence says 'yesterday'.", isCorrect: false },
      { text: "was", rationale: "This is past tense, but used for singular subjects (I/he/she/it).", isCorrect: false },
      { text: "were", rationale: "Correct past tense form of 'to be' for plural subjects (they/we/you).", isCorrect: true },
      { text: "be", rationale: "This is the base form, not conjugated for the past.", isCorrect: false },
    ],
    hint: "The subject is 'They' and the time is 'yesterday'."
  },
  {
    category: "Pronouns",
    question: "I saw Sarah at the mall, but I didn't speak to ____.",
    answerOptions: [
      { text: "she", rationale: "This is a subject pronoun, but we need an object pronoun after the preposition 'to'.", isCorrect: false },
      { text: "her", rationale: "Correct object pronoun for a female person.", isCorrect: true },
      { text: "hers", rationale: "This is a possessive pronoun, not an object pronoun.", isCorrect: false },
      { text: "him", rationale: "This is the object pronoun for a male person.", isCorrect: false },
    ],
    hint: "Sarah is a female name. You need the object form."
  },
  {
    category: "Comparatives",
    question: "This book is ____ than the one I read last week.",
    answerOptions: [
      { text: "more good", rationale: "'Good' is an irregular adjective; its comparative is 'better'.", isCorrect: false },
      { text: "gooder", rationale: "'Good' is irregular; we don't add '-er'.", isCorrect: false },
      { text: "better", rationale: "Correct irregular comparative form of 'good'.", isCorrect: true },
      { text: "best", rationale: "This is the superlative form, used for comparing three or more things.", isCorrect: false },
    ],
    hint: "The comparative of 'good' is irregular."
  },
  {
    category: "Vocabulary",
    question: "What is the opposite of 'expensive'?",
    answerOptions: [
      { text: "Cheap", rationale: "Correct! 'Cheap' means low in price.", isCorrect: true },
      { text: "Fast", rationale: "This refers to speed, not price.", isCorrect: false },
      { text: "Small", rationale: "This refers to size, not price.", isCorrect: false },
      { text: "New", rationale: "This refers to age, not price.", isCorrect: false },
    ],
    hint: "Think about something that doesn't cost a lot of money."
  },
  {
    category: "Prepositions",
    question: "The meeting is ____ Monday ____ 9:00 AM.",
    answerOptions: [
      { text: "in / at", rationale: "We use 'on' for days of the week.", isCorrect: false },
      { text: "on / in", rationale: "We use 'at' for specific times.", isCorrect: false },
      { text: "on / at", rationale: "Correct! 'On' for days and 'at' for specific times.", isCorrect: true },
      { text: "at / on", rationale: "The order is reversed.", isCorrect: false },
    ],
    hint: "Days use 'on', times use 'at'."
  },
  {
    category: "Tenses",
    question: "I ____ my homework yet.",
    answerOptions: [
      { text: "didn't finish", rationale: "While common in speech, 'yet' usually triggers the present perfect.", isCorrect: false },
      { text: "haven't finished", rationale: "Correct! Present perfect is used with 'yet' for unfinished actions.", isCorrect: true },
      { text: "don't finish", rationale: "This is simple present, which doesn't fit with 'yet' in this context.", isCorrect: false },
      { text: "not finished", rationale: "Missing the auxiliary verb 'have'.", isCorrect: false },
    ],
    hint: "The word 'yet' often indicates the present perfect tense."
  },
  {
    category: "Articles",
    question: "He is ____ honest man.",
    answerOptions: [
      { text: "a", rationale: "Even though 'honest' starts with 'h', the sound is a vowel (/o/), so we use 'an'.", isCorrect: false },
      { text: "an", rationale: "Correct! We use 'an' before words starting with a vowel sound.", isCorrect: true },
      { text: "the", rationale: "This would imply he is the only honest man, which is unlikely in this context.", isCorrect: false },
      { text: "some", rationale: "This is used for plural or uncountable nouns.", isCorrect: false },
    ],
    hint: "Focus on the sound of the first letter of 'honest'."
  },
  {
    category: "Plurals",
    question: "What is the plural of 'child'?",
    answerOptions: [
      { text: "childs", rationale: "'Child' has an irregular plural form.", isCorrect: false },
      { text: "childrens", rationale: "'Children' is already plural; no 's' is needed.", isCorrect: false },
      { text: "children", rationale: "Correct! This is the irregular plural of 'child'.", isCorrect: true },
      { text: "childes", rationale: "Not a word.", isCorrect: false },
    ],
    hint: "This is an irregular plural noun."
  },
  {
    category: "Modals",
    question: "You ____ smoke in the hospital. It's forbidden.",
    answerOptions: [
      { text: "don't have to", rationale: "This means it's not necessary, but 'mustn't' means it's forbidden.", isCorrect: false },
      { text: "mustn't", rationale: "Correct! 'Mustn't' is used for prohibition.", isCorrect: true },
      { text: "shouldn't", rationale: "This is for advice, but 'mustn't' is stronger for rules.", isCorrect: false },
      { text: "can", rationale: "This means you are allowed, which is the opposite of forbidden.", isCorrect: false },
    ],
    hint: "Which word expresses that something is strictly forbidden?"
  }
];

export default function DailyBlitzQuiz() {
  const [step, setStep] = useState<'start' | 'quiz' | 'results'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();

  useEffect(() => {
    if (step === 'results') {
      saveQuizProgress({
        quiz_id: 'daily-blitz',
        score: score,
        total_questions: shuffledQuestions.length
      });
    }
  }, [step, score, shuffledQuestions.length]);

  const startQuiz = () => {
    performAction(() => {
      const shuffled = [...DAILY_BLITZ_DATA].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled);
      setStep('quiz');
      setCurrentIndex(0);
      setScore(0);
      setTimeLeft(15);
      setSelectedOption(null);
      setIsAnswered(false);
    });
  };

  const handleNext = useCallback(() => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(15);
      setSelectedOption(null);
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

  const handleOptionClick = (index: number, isCorrect: boolean) => {
    if (isAnswered) return;
    setSelectedOption(index);
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
                  <Zap className="w-12 h-12 text-amber-400" />
                </div>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-[#e5ebfc]">
                DAILY <span className="text-amber-400">BLITZ</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12 max-w-lg mx-auto">
                A fast-paced mix of all topics! You have 15 seconds per question. Ready to keep your streak alive?
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startQuiz}
                className="bg-amber-400 text-[#002442] px-12 py-5 rounded-2xl font-bold text-xl shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-colors"
              >
                Start Blitz
              </motion.button>
            </motion.div>
          )}

          {step === 'quiz' && currentQuestion && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Header Info */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-amber-400 font-bold text-sm uppercase tracking-wider">{currentQuestion.category}</span>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-[#a5abbb] font-medium">
                    <span className="bg-gray-100 dark:bg-[#121a28] px-4 py-2 rounded-lg border border-gray-200 dark:border-[#424855]/20">
                      Question {currentIndex + 1} / {shuffledQuestions.length}
                    </span>
                  </div>
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
                  <TTSButton text={currentQuestion.question.replace(/____/g, '...')} className="mt-1" />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.answerOptions.map((option, idx) => {
                  let statusClass = "bg-gray-50 dark:bg-[#121a28] border-gray-200 dark:border-[#424855]/10 hover:bg-white dark:hover:bg-[#1d2636]";
                  if (isAnswered) {
                    if (option.isCorrect) {
                      statusClass = "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400";
                    } else if (selectedOption === idx) {
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
                      onClick={() => handleOptionClick(idx, option.isCorrect)}
                      disabled={isAnswered}
                      className={`p-6 rounded-2xl border-2 text-left font-bold text-lg transition-all duration-300 flex justify-between items-center ${statusClass}`}
                    >
                      <span>{option.text}</span>
                      <div className="flex items-center gap-2">
                        {isAnswered && option.isCorrect && (
                          <>
                            <TTSButton 
                              text={currentQuestion.question.includes('____') 
                                ? currentQuestion.question.replace(/____/g, option.text)
                                : option.text} 
                              className="mr-2" 
                            />
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          </>
                        )}
                        {isAnswered && !option.isCorrect && selectedOption === idx && <XCircle className="w-6 h-6 text-red-500" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Rationale & Hint */}
              <AnimatePresence>
                {isAnswered ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-400/5 p-6 rounded-2xl border border-amber-400/20"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-900 dark:text-[#e5ebfc] font-medium mb-2">
                          {selectedOption !== null 
                            ? currentQuestion.answerOptions[selectedOption].rationale 
                            : "Time's up! The correct answer is highlighted above."}
                        </p>
                        <button
                          onClick={handleNext}
                          className="mt-4 flex items-center gap-2 text-amber-400 font-bold hover:gap-3 transition-all"
                        >
                          {currentIndex === shuffledQuestions.length - 1 ? 'Finish Blitz' : 'Next Question'}
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-gray-500 dark:text-[#a5abbb] italic"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Hint: {currentQuestion.hint}
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
                  <Zap className="w-16 h-16 text-amber-400" />
                </div>
              </div>
              <h2 className="font-headline text-4xl font-extrabold mb-4 text-gray-900 dark:text-[#e5ebfc]">
                Blitz Completed!
              </h2>
              <div className="text-6xl font-black text-amber-400 mb-6">
                {score} / {shuffledQuestions.length}
              </div>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12">
                {score === shuffledQuestions.length 
                  ? "Incredible! You're a Blitz Master!" 
                  : score > shuffledQuestions.length / 2 
                  ? "Well done! Your English is sharp today." 
                  : "Good effort! Keep practicing to improve your speed."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="bg-amber-400 text-[#002442] px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restart Blitz
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
