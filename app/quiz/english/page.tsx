'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Timer, CheckCircle2, XCircle, RotateCcw, ArrowRight, Lightbulb, Globe } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
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
}

const QUIZ_DATA: Question[] = [
  {
    question: "Where _____ his sister work? (present)",
    answerOptions: [
      {
        text: "does",
        rationale: "This auxiliary verb is used for questions in the simple present with a third-person singular subject like 'his sister'.",
        isCorrect: true,
      },
      {
        text: "do",
        rationale: "This auxiliary verb is used for simple present questions, but not with third-person singular subjects.",
        isCorrect: false,
      },
      {
        text: "is",
        rationale: "This verb is used for continuous tenses or states of being, not for actions like 'work' in this question structure.",
        isCorrect: false,
      },
      {
        text: "did",
        rationale: "This auxiliary verb is used for questions in the past tense, not the present.",
        isCorrect: false,
      },
    ],
    hint: "For questions in the present tense about 'he', 'she', or 'it', we use a specific helper verb.",
  },
  {
    question: "Would you mind _____ the window?",
    answerOptions: [
      {
        text: "open",
        rationale: "This is the base form of the verb, which is not the correct structure following the phrase 'would you mind'.",
        isCorrect: false,
      },
      {
        text: "opening",
        rationale: "The expression 'would you mind' is always followed by the gerund (-ing) form of a verb.",
        isCorrect: true,
      },
      {
        text: "to open",
        rationale: "This is the infinitive form, used in other constructions but not after 'would you mind'.",
        isCorrect: false,
      },
      {
        text: "opened",
        rationale: "This is the past tense form and does not fit grammatically in this polite request.",
        isCorrect: false,
      },
    ],
    hint: "The phrase 'Would you mind...' is followed by a verb in its gerund form (-ing).",
  },
  {
    question: "Choose the word that best fits: 'I’m really ______ about the trip!'",
    answerOptions: [
      {
        text: "excited",
        rationale: "This adjective ending in '-ed' is used to describe how a person feels.",
        isCorrect: true,
      },
      {
        text: "exciting",
        rationale: "This adjective ending in '-ing' describes the thing that causes the emotion, such as 'an exciting trip'.",
        isCorrect: false,
      },
      {
        text: "bored",
        rationale: "This describes a feeling, but it is the opposite of what would be expected in this context.",
        isCorrect: false,
      },
      {
        text: "boring",
        rationale: "This adjective describes the thing that causes the feeling of boredom, not the feeling itself.",
        isCorrect: false,
      },
    ],
    hint: "The word should describe a person's feeling, not the thing that causes the feeling.",
  },
  {
    question: "____ you like to go to the movies tonight?",
    answerOptions: [
      {
        text: "Do",
        rationale: "This would form a question about a general preference, 'Do you like to go...', not a specific invitation.",
        isCorrect: false,
      },
      {
        text: "Are",
        rationale: "This verb does not fit grammatically with 'like' in this question structure for an invitation.",
        isCorrect: false,
      },
      {
        text: "Would",
        rationale: "This modal verb is used to form a polite invitation with the verb 'like'.",
        isCorrect: true,
      },
      {
        text: "Did",
        rationale: "This auxiliary verb would place the question in the past, which contradicts 'tonight'.",
        isCorrect: false,
      },
    ],
    hint: "This word is used to make a polite offer or invitation.",
  },
  {
    question: "Helen _____ shopping every week.",
    answerOptions: [
      {
        text: "goes",
        rationale: "This is the correct third-person singular present tense form for a routine action.",
        isCorrect: true,
      },
      {
        text: "go",
        rationale: "This form is used with I, you, we, and they, but not with a third-person singular subject like 'Helen'.",
        isCorrect: false,
      },
      {
        text: "went",
        rationale: "This is the past tense form, but the sentence describes a current, weekly habit.",
        isCorrect: false,
      },
      {
        text: "is going",
        rationale: "This tense is for actions happening now or planned for the near future, not for a general routine.",
        isCorrect: false,
      },
    ],
    hint: "For routine actions in the present tense with 'he', 'she', or 'it', the verb needs a specific ending.",
  },
  {
    question: "Who is the _______ person in your family?",
    answerOptions: [
      {
        text: "tall",
        rationale: "This is the base adjective, used for description but not for comparison to this degree.",
        isCorrect: false,
      },
      {
        text: "taller",
        rationale: "This is the comparative form, used to compare two people, not one against a whole group.",
        isCorrect: false,
      },
      {
        text: "most tall",
        rationale: "For short adjectives like 'tall', we add '-est' for the superlative form, rather than using 'most'.",
        isCorrect: false,
      },
      {
        text: "tallest",
        rationale: "This is the superlative form, used to single out one person from a group of three or more.",
        isCorrect: true,
      },
    ],
    hint: "To compare one thing against a whole group, you need the superlative form of the adjective.",
  },
  {
    question: "Bob__________ play soccer when he was young.",
    answerOptions: [
      {
        text: "used to",
        rationale: "This phrase correctly describes a repeated action or habit in the past that is no longer true.",
        isCorrect: true,
      },
      {
        text: "is used to",
        rationale: "This phrase means 'is accustomed to' and is followed by a gerund (e.g., 'is used to playing').",
        isCorrect: false,
      },
      {
        text: "uses to",
        rationale: "This is a common grammatical error; the correct phrase for past habits does not change for the third person.",
        isCorrect: false,
      },
      {
        text: "was using to",
        rationale: "This structure is not grammatically correct for describing a past habit.",
        isCorrect: false,
      },
    ],
    hint: "This phrase is used to talk about habits in the past that are finished now.",
  },
  {
    question: "Has Mr. Johnson arrived ______ ?",
    answerOptions: [
      {
        text: "already",
        rationale: "'Already' is typically used in affirmative sentences to say something happened sooner than expected.",
        isCorrect: false,
      },
      {
        text: "still",
        rationale: "'Still' is used to say a situation continues to exist, often in affirmative sentences.",
        isCorrect: false,
      },
      {
        text: "yet",
        rationale: "This word is used in questions and negative sentences to ask if something expected has happened.",
        isCorrect: true,
      },
      {
        text: "since",
        rationale: "'Since' is used to indicate a starting point in time, which doesn't fit this question's structure.",
        isCorrect: false,
      },
    ],
    hint: "This word is often used in questions and negative sentences to ask about something we are expecting to happen.",
  },
  {
    question: "There are ____ things that I haven't told you.",
    answerOptions: [
      {
        text: "a few",
        rationale: "This indicates a small, countable number of items, fitting the context of 'things'.",
        isCorrect: true,
      },
      {
        text: "a little",
        rationale: "This is used with uncountable nouns (like water or time), not countable nouns like 'things'.",
        isCorrect: false,
      },
      {
        text: "much",
        rationale: "'Much' is used with uncountable nouns, typically in questions and negative sentences.",
        isCorrect: false,
      },
      {
        text: "any",
        rationale: "While 'any' can be used in negative sentences, 'a few' better expresses the idea of a specific, small quantity.",
        isCorrect: false,
      },
    ],
    hint: "You need a phrase that means 'a small number' for countable nouns like 'things'.",
  },
  {
    question: "We didn't find ____ decent restaurants in the area.",
    answerOptions: [
      {
        text: "any",
        rationale: "This word is used in negative sentences and questions with countable or uncountable nouns.",
        isCorrect: true,
      },
      {
        text: "some",
        rationale: "'Some' is generally used in affirmative sentences, not negative ones like this.",
        isCorrect: false,
      },
      {
        text: "no",
        rationale: "Using 'no' here would create a double negative ('didn't find no'), which is grammatically incorrect.",
        isCorrect: false,
      },
      {
        text: "a few",
        rationale: "This implies you found a small number, which contradicts the negative verb 'didn't find'.",
        isCorrect: false,
      },
    ],
    hint: "In negative sentences, we often use a specific word to talk about a quantity of zero.",
  },
];

export default function EnglishQuiz() {
  const [step, setStep] = useState<'start' | 'quiz' | 'results'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();

  useEffect(() => {
    if (step === 'results') {
      saveQuizProgress({
        quiz_id: 'english-fundamentals',
        score: score,
        total_questions: shuffledQuestions.length
      });
    }
  }, [step, score, shuffledQuestions.length]);

  const startQuiz = () => {
    performAction(() => {
      const shuffled = [...QUIZ_DATA].sort(() => Math.random() - 0.5);
      setShuffledQuestions(shuffled);
      setStep('quiz');
      setCurrentIndex(0);
      setScore(0);
      setTimeLeft(20);
      setSelectedOption(null);
      setIsAnswered(false);
    });
  };

  const handleNext = useCallback(() => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(20);
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
                <div className="w-24 h-24 bg-[#6cb2ff]/10 rounded-3xl flex items-center justify-center">
                  <Globe className="w-12 h-12 text-[#6cb2ff]" />
                </div>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-[#e5ebfc]">
                QUESTIONS TO PRACTICE <span className="text-[#6cb2ff]">ENGLISH</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12 max-w-lg mx-auto">
                You&apos;ll have 20 seconds for each question. Test your skills and aim for a perfect score!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startQuiz}
                className="bg-[#6cb2ff] text-[#002442] px-12 py-5 rounded-2xl font-bold text-xl shadow-lg shadow-[#6cb2ff]/20 hover:bg-[#58a2f0] transition-colors"
              >
                Start Quiz
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
                <div className="flex items-center gap-3 text-gray-600 dark:text-[#a5abbb] font-medium">
                  <span className="bg-gray-100 dark:bg-[#121a28] px-4 py-2 rounded-lg border border-gray-200 dark:border-[#424855]/20">
                    Question {currentIndex + 1} / {shuffledQuestions.length}
                  </span>
                </div>
                <div className={`flex items-center gap-2 font-bold text-lg ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-[#6cb2ff]'}`}>
                  <Timer className="w-6 h-6" />
                  {timeLeft}s
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-gray-100 dark:bg-[#121a28] rounded-full overflow-hidden border border-gray-200 dark:border-[#424855]/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / shuffledQuestions.length) * 100}%` }}
                  className="h-full bg-[#6cb2ff]"
                />
              </div>

              {/* Question */}
              <div className="bg-gray-50 dark:bg-[#121a28] p-8 rounded-3xl border border-gray-200 dark:border-[#424855]/10 shadow-sm">
                <h2 className="font-headline text-2xl md:text-3xl font-bold text-gray-900 dark:text-[#e5ebfc] leading-tight">
                  {currentQuestion.question}
                </h2>
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
                      {isAnswered && option.isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                      {isAnswered && !option.isCorrect && selectedOption === idx && <XCircle className="w-6 h-6 text-red-500" />}
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
                    className="bg-[#6cb2ff]/5 p-6 rounded-2xl border border-[#6cb2ff]/20"
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-6 h-6 text-[#6cb2ff] shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-900 dark:text-[#e5ebfc] font-medium mb-2">
                          {selectedOption !== null 
                            ? currentQuestion.answerOptions[selectedOption].rationale 
                            : "Time's up! The correct answer is highlighted above."}
                        </p>
                        <button
                          onClick={handleNext}
                          className="mt-4 flex items-center gap-2 text-[#6cb2ff] font-bold hover:gap-3 transition-all"
                        >
                          {currentIndex === shuffledQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
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
                <div className="w-32 h-32 bg-[#91f8b8]/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-16 h-16 text-[#91f8b8]" />
                </div>
              </div>
              <h2 className="font-headline text-4xl font-extrabold mb-4 text-gray-900 dark:text-[#e5ebfc]">
                Quiz Completed!
              </h2>
              <div className="text-6xl font-black text-[#6cb2ff] mb-6">
                {score} / {shuffledQuestions.length}
              </div>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12">
                {score === shuffledQuestions.length 
                  ? "Perfect! You're a master of English fundamentals." 
                  : score > shuffledQuestions.length / 2 
                  ? "Great job! You have a solid grasp of the language." 
                  : "Keep practicing! Consistency is the key to fluency."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="bg-[#6cb2ff] text-[#002442] px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restart Quiz
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
