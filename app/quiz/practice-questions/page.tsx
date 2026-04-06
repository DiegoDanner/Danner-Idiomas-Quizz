'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, RotateCcw, ArrowRight, HelpCircle, Timer, Trophy, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TTSButton from '@/components/TTSButton';
import { useAuthAction } from '@/hooks/useAuthAction';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { saveQuizProgress } from '@/lib/progress';

interface AnswerOption {
  text: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  answerOptions: AnswerOption[];
  hint: string;
}

const QUIZ_DATA: Question[] = [
  { 
    question: "Where _____ his sister work? (present)", 
    answerOptions: [ 
      { text: "does", isCorrect: true }, 
      { text: "do", isCorrect: false }, 
      { text: "is", isCorrect: false }, 
      { text: "did", isCorrect: false } 
    ], 
    hint: "For questions in the present tense about 'he', 'she', or 'it', we use a specific helper verb." 
  },
  { 
    question: "Would you mind _____ the window?", 
    answerOptions: [ 
      { text: "opening", isCorrect: true }, 
      { text: "open", isCorrect: false }, 
      { text: "to open", isCorrect: false }, 
      { text: "opened", isCorrect: false } 
    ], 
    hint: "The phrase 'Would you mind...' is followed by a verb in its gerund form (-ing)." 
  },
  { 
    question: "Choose the word that best fits: 'I’m really ______ about the trip!'", 
    answerOptions: [ 
      { text: "excited", isCorrect: true }, 
      { text: "exciting", isCorrect: false }, 
      { text: "bored", isCorrect: false }, 
      { text: "boring", isCorrect: false } 
    ], 
    hint: "The word should describe a person's feeling, not the thing that causes the feeling." 
  },
  { 
    question: "____ you like to go to the movies tonight?", 
    answerOptions: [ 
      { text: "Would", isCorrect: true }, 
      { text: "Do", isCorrect: false }, 
      { text: "Are", isCorrect: false }, 
      { text: "Did", isCorrect: false } 
    ], 
    hint: "This word is used to make a polite offer or invitation." 
  },
  { 
    question: "Helen _____ shopping every week.", 
    answerOptions: [ 
      { text: "goes", isCorrect: true }, 
      { text: "go", isCorrect: false }, 
      { text: "went", isCorrect: false }, 
      { text: "is going", isCorrect: false } 
    ], 
    hint: "For routine actions in the present tense with 'he', 'she', or 'it', the verb needs a specific ending." 
  },
  { 
    question: "How often _____ you go to the gym?", 
    answerOptions: [ 
      { text: "do", isCorrect: true }, 
      { text: "does", isCorrect: false }, 
      { text: "are", isCorrect: false }, 
      { text: "is", isCorrect: false } 
    ], 
    hint: "Use 'do' for present simple questions with 'I', 'you', 'we', or 'they'." 
  },
  { 
    question: "I haven't seen him _____ last year.", 
    answerOptions: [ 
      { text: "since", isCorrect: true }, 
      { text: "for", isCorrect: false }, 
      { text: "during", isCorrect: false }, 
      { text: "in", isCorrect: false } 
    ], 
    hint: "Use 'since' to refer to a specific point in time in the past." 
  },
  { 
    question: "She is the _____ person I know.", 
    answerOptions: [ 
      { text: "smartest", isCorrect: true }, 
      { text: "smarter", isCorrect: false }, 
      { text: "most smart", isCorrect: false }, 
      { text: "smart", isCorrect: false } 
    ], 
    hint: "Use the superlative form '-est' for short adjectives." 
  },
  { 
    question: "If it _____ tomorrow, we will stay home.", 
    answerOptions: [ 
      { text: "rains", isCorrect: true }, 
      { text: "rain", isCorrect: false }, 
      { text: "will rain", isCorrect: false }, 
      { text: "rained", isCorrect: false } 
    ], 
    hint: "In the first conditional, use the present simple after 'if'." 
  },
  { 
    question: "They _____ to Paris twice already.", 
    answerOptions: [ 
      { text: "have been", isCorrect: true }, 
      { text: "were", isCorrect: false }, 
      { text: "had been", isCorrect: false }, 
      { text: "are", isCorrect: false } 
    ], 
    hint: "Use the present perfect to talk about life experiences without a specific time." 
  },
  { 
    question: "I'm looking forward to _____ you.", 
    answerOptions: [ 
      { text: "meeting", isCorrect: true }, 
      { text: "meet", isCorrect: false }, 
      { text: "to meet", isCorrect: false }, 
      { text: "met", isCorrect: false } 
    ], 
    hint: "The expression 'look forward to' is followed by a gerund (-ing)." 
  },
  { 
    question: "He _____ a new car last month.", 
    answerOptions: [ 
      { text: "bought", isCorrect: true }, 
      { text: "buys", isCorrect: false }, 
      { text: "has bought", isCorrect: false }, 
      { text: "was buying", isCorrect: false } 
    ], 
    hint: "Use the past simple for actions that were completed at a specific time in the past." 
  },
  { 
    question: "This book was _____ by a famous author.", 
    answerOptions: [ 
      { text: "written", isCorrect: true }, 
      { text: "wrote", isCorrect: false }, 
      { text: "write", isCorrect: false }, 
      { text: "writing", isCorrect: false } 
    ], 
    hint: "In the passive voice, use 'be' + the past participle of the verb." 
  },
  { 
    question: "You _____ smoke in the hospital.", 
    answerOptions: [ 
      { text: "mustn't", isCorrect: true }, 
      { text: "don't have to", isCorrect: false }, 
      { text: "shouldn't", isCorrect: false }, 
      { text: "couldn't", isCorrect: false } 
    ], 
    hint: "Use 'mustn't' to express a strong prohibition." 
  },
  { 
    question: "I don't have _____ money left.", 
    answerOptions: [ 
      { text: "any", isCorrect: true }, 
      { text: "some", isCorrect: false }, 
      { text: "many", isCorrect: false }, 
      { text: "few", isCorrect: false } 
    ], 
    hint: "Use 'any' for uncountable nouns in negative sentences." 
  },
];

export default function PracticeQuestionsQuiz() {
  const [step, setStep] = useState<'start' | 'quiz' | 'results'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();
  const { user } = useAuth();

  useEffect(() => {
    if (step === 'results' && user) {
      saveQuizProgress({
        quiz_id: 'practice-questions',
        score: score,
        total_questions: shuffledQuestions.length,
      });
    }
  }, [step, user, score, shuffledQuestions.length]);

  const startQuiz = useCallback(() => {
    performAction(() => {
      const shuffled = [...QUIZ_DATA].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled);
      setStep('quiz');
      setCurrentIndex(0);
      setScore(0);
      setIsAnswered(false);
      setSelectedOption(null);
      setTimeLeft(20);
    });
  }, [performAction]);

  const handleNext = useCallback(() => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedOption(null);
      setTimeLeft(20);
    } else {
      setStep('results');
    }
  }, [currentIndex, shuffledQuestions.length]);

  const handleAnswer = useCallback((option: AnswerOption) => {
    if (isAnswered || timeLeft <= 0) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    setSelectedOption(option.text);
    setIsAnswered(true);
    
    if (option.isCorrect) {
      setScore(prev => prev + 1);
    }
  }, [isAnswered, timeLeft]);

  useEffect(() => {
    if (step === 'quiz' && !isAnswered && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsAnswered(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, isAnswered, timeLeft]);

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
                <div className="w-24 h-24 bg-[#6cb2ff]/10 rounded-3xl flex items-center justify-center">
                  <HelpCircle className="w-12 h-12 text-[#6cb2ff]" />
                </div>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-[#e5ebfc]">
                QUESTIONS TO <span className="text-[#6cb2ff]">PRACTICE</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12 max-w-lg mx-auto">
                Test your English skills with a variety of questions. You have 20 seconds for each question. Good luck!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startQuiz}
                className="bg-[#6cb2ff] text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-lg shadow-[#6cb2ff]/20 hover:bg-[#6cb2ff]/80 transition-colors"
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
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-[#6cb2ff]/10 px-4 py-2 rounded-xl text-[#6cb2ff] font-bold flex items-center gap-2">
                    <Timer className={`w-5 h-5 ${timeLeft <= 5 ? 'animate-pulse text-red-500' : ''}`} />
                    {timeLeft}s
                  </div>
                  <div className="text-gray-500 font-bold">
                    Question {currentIndex + 1} / {shuffledQuestions.length}
                  </div>
                </div>
                <div className="flex gap-2">
                  {shuffledQuestions.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-2 w-4 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? 'bg-[#6cb2ff] w-8' : idx < currentIndex ? 'bg-[#6cb2ff]/40' : 'bg-gray-200 dark:bg-[#121a28]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#121a28] p-10 rounded-[2.5rem] border border-gray-200 dark:border-[#424855]/10 shadow-xl relative group">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-2xl md:text-3xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc] text-center leading-relaxed flex-1">
                    {currentQuestion.question}
                  </h2>
                  <TTSButton text={currentQuestion.question.replace(/_____/g, '...')} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentQuestion.answerOptions.map((option) => {
                  let statusClass = "bg-white dark:bg-[#121a28] border-gray-200 dark:border-[#424855]/10 text-gray-700 dark:text-[#e5ebfc] hover:border-[#6cb2ff]/50";
                  
                  if (isAnswered) {
                    if (option.isCorrect) {
                      statusClass = "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20";
                    } else if (selectedOption === option.text) {
                      statusClass = "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20";
                    } else {
                      statusClass = "opacity-50 bg-gray-100 dark:bg-[#121a28] border-transparent text-gray-400";
                    }
                  }

                  return (
                    <motion.button
                      key={option.text}
                      whileHover={!isAnswered ? { y: -4, scale: 1.02 } : {}}
                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(option)}
                      disabled={isAnswered}
                      className={`p-6 rounded-2xl border-2 font-bold text-lg transition-all text-center ${statusClass}`}
                    >
                      <div className="flex-1 text-center">{option.text}</div>
                      {isAnswered && option.isCorrect && (
                        <TTSButton 
                          text={currentQuestion.question.includes('_____') 
                            ? currentQuestion.question.replace(/_____/g, option.text)
                            : option.text} 
                          className="ml-2" 
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className={`p-6 rounded-2xl border flex items-start gap-4 ${
                      timeLeft === 0 
                        ? 'bg-[#6cb2ff]/10 border-[#6cb2ff]/30 text-[#6cb2ff] dark:text-[#6cb2ff]'
                        : selectedOption === currentQuestion.answerOptions.find(o => o.isCorrect)?.text
                        ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' 
                        : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
                    }`}>
                      {timeLeft === 0 ? (
                        <AlertCircle className="w-6 h-6 shrink-0" />
                      ) : selectedOption === currentQuestion.answerOptions.find(o => o.isCorrect)?.text ? (
                        <CheckCircle2 className="w-6 h-6 shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-lg">
                          {timeLeft === 0 ? "Time's up!" : selectedOption === currentQuestion.answerOptions.find(o => o.isCorrect)?.text ? 'Correct!' : 'Incorrect'}
                        </p>
                        <p className="opacity-90">{currentQuestion.hint}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleNext}
                      className="w-full bg-[#6cb2ff] text-white font-bold py-5 rounded-2xl text-xl flex items-center justify-center gap-2 hover:bg-[#6cb2ff]/80 transition-all shadow-lg shadow-[#6cb2ff]/20"
                    >
                      {currentIndex === shuffledQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                      <ArrowRight className="w-6 h-6" />
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
                <div className="w-32 h-32 bg-[#6cb2ff]/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-16 h-16 text-[#6cb2ff]" />
                </div>
              </div>
              <h2 className="font-headline text-4xl font-extrabold mb-4 text-gray-900 dark:text-[#e5ebfc]">
                Quiz Complete!
              </h2>
              <div className="text-7xl font-black text-[#6cb2ff] mb-6">
                {score} / {shuffledQuestions.length}
              </div>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12">
                {score === shuffledQuestions.length 
                  ? "Perfect score! You're a grammar master!" 
                  : score >= shuffledQuestions.length * 0.75 
                  ? "Great job! You really know your stuff." 
                  : score >= shuffledQuestions.length * 0.5 
                  ? "Not bad! A solid effort." 
                  : "Keep practicing! You'll get there."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="bg-[#6cb2ff] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
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
