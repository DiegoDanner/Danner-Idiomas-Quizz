'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, RotateCcw, ArrowRight, UserSearch, AlertCircle, ChevronDown, Info } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TTSButton from '@/components/TTSButton';
import { useAuthAction } from '@/hooks/useAuthAction';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { saveQuizProgress } from '@/lib/progress';

interface QuizItem {
  id: string;
  correctAnswer: string;
  options: string[];
}

interface Question {
  story: string;
  explanation: string;
  placeholders: QuizItem[];
}

const OBJECT_PRONOUN_QUESTIONS: Question[] = [
  {
    story: "Mark is very busy today. What time can {0} call {1} to discuss {2} project?",
    explanation: "In this sentence, 'I' is the subject pronoun (performing the action), 'him' is the object pronoun (receiving the call), and 'my' is a possessive adjective (indicating the project belongs to me).",
    placeholders: [
      { id: "q1_0", correctAnswer: "I", options: ["I", "me", "my", "mine"] },
      { id: "q1_1", correctAnswer: "him", options: ["he", "him", "his", "himself"] },
      { id: "q1_2", correctAnswer: "my", options: ["I", "me", "my", "mine"] }
    ]
  },
  {
    story: "My brother can be stubborn sometimes. {0} never listens to {1} when we try to give advice.",
    explanation: "'He' is the subject pronoun because it's him (my brother) who performs the action of not listening. 'Us' is the object pronoun because we are the object of the listening action (he doesn't listen to us).",
    placeholders: [
      { id: "q2_0", correctAnswer: "He", options: ["He", "Him", "His", "He's"] },
      { id: "q2_1", correctAnswer: "us", options: ["we", "us", "our", "ours"] }
    ]
  },
  {
    story: "My friend showed me her new glasses. 'Do you like my new glasses?' she asked. 'Yes, {0} love {1}. They look great on you!'",
    explanation: "'I' is the subject pronoun, the person who loves the glasses. 'Them' is the object pronoun replacing 'glasses' (a plural noun), indicating what is loved.",
    placeholders: [
      { id: "q3_0", correctAnswer: "I", options: ["I", "me", "my", "mine"] },
      { id: "q3_1", correctAnswer: "them", options: ["they", "them", "their", "theirs"] }
    ]
  },
  {
    story: "Tom has two pet rabbits. {0} loves to play with {1} in the garden every afternoon.",
    explanation: "'He' is the subject pronoun referring to Tom. 'Them' is the object pronoun replacing 'rabbits' (plural), indicating who Tom plays with.",
    placeholders: [
      { id: "q4_0", correctAnswer: "He", options: ["He", "Him", "His", "He's"] },
      { id: "q4_1", correctAnswer: "them", options: ["they", "them", "their", "theirs"] }
    ]
  },
  {
    story: "My mom sounded upset on the phone. She said: 'Please, call {0} soon; {1} am very worried about you.'",
    explanation: "'call me' - 'me' is the object pronoun, receiving the action of calling. 'I am' - 'I' is the subject pronoun, the one feeling worried.",
    placeholders: [
      { id: "q5_0", correctAnswer: "me", options: ["I", "me", "my", "mine"] },
      { id: "q5_1", correctAnswer: "I", options: ["I", "me", "my", "mine"] }
    ]
  },
  {
    story: "We are at the concert. Look, Sara and Kevin are over there by the stage. Can {0} see {1} from here, or are {2} too far?",
    explanation: "'Can you' - 'you' is the subject of the question. 'see them' - 'them' is the object pronoun for Sara and Kevin. 'are they' - 'they' is the subject of the second question.",
    placeholders: [
      { id: "q6_0", correctAnswer: "you", options: ["you", "your", "yours", "yourself"] },
      { id: "q6_1", correctAnswer: "them", options: ["they", "them", "their", "theirs"] },
      { id: "q6_2", correctAnswer: "they", options: ["they", "them", "their", "theirs"] }
    ]
  },
  {
    story: "I need to talk to John about the meeting. Tell John that {0} can meet {1} at the canteen after class.",
    explanation: "'we can meet' - 'we' is the subject pronoun, as we are the ones who will meet. 'meet him' - 'him' is the object pronoun referring to John.",
    placeholders: [
      { id: "q7_0", correctAnswer: "we", options: ["we", "us", "our", "ours"] },
      { id: "q7_1", correctAnswer: "him", options: ["he", "him", "his", "himself"] }
    ]
  },
  {
    story: "Your new earrings are beautiful! I really like {0}. Can {1} see {2} up close?",
    explanation: "The first and third 'them' are object pronouns for 'earrings' (plural). 'I' is the subject pronoun (the person who wants to see the earrings).",
    placeholders: [
      { id: "q8_0", correctAnswer: "them", options: ["they", "them", "their", "theirs"] },
      { id: "q8_1", correctAnswer: "I", options: ["I", "me", "my", "mine"] },
      { id: "q8_2", correctAnswer: "them", options: ["they", "them", "their", "theirs"] }
    ]
  },
  {
    story: "We saw someone familiar across the street. Look at that man. Who is {0}? Do {1} know {2}?",
    explanation: "'Who is he?' - 'he' is the subject pronoun. 'Do you know' - 'you' is the subject of the question. 'know him' - 'him' is the object pronoun.",
    placeholders: [
      { id: "q9_0", correctAnswer: "he", options: ["he", "him", "his", "he's"] },
      { id: "q9_1", correctAnswer: "you", options: ["you", "your", "yours", "yourself"] },
      { id: "q9_2", correctAnswer: "him", options: ["he", "him", "his", "himself"] }
    ]
  },
  {
    story: "Do you know the new colleague? That man over there is David. {0} work with {1} on the marketing team.",
    explanation: "'I work' - 'I' is the subject pronoun. 'with him' - 'him' is the object pronoun referring to David.",
    placeholders: [
      { id: "q10_0", correctAnswer: "I", options: ["I", "me", "my", "mine"] },
      { id: "q10_1", correctAnswer: "him", options: ["he", "him", "his", "himself"] }
    ]
  },
  {
    story: "I need to talk to my sister. Can you give {0} her new phone number?",
    explanation: "'give me' - 'me' is the object pronoun, as it's the person receiving the phone number.",
    placeholders: [
      { id: "q11_0", correctAnswer: "me", options: ["I", "me", "my", "mine"] }
    ]
  }
];

export default function ObjectPronounsQuiz() {
  const [step, setStep] = useState<'start' | 'quiz' | 'results'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();
  const { user } = useAuth();

  useEffect(() => {
    if (step === 'results' && user) {
      saveQuizProgress({
        quiz_id: 'object-pronouns',
        score: score,
        total_questions: OBJECT_PRONOUN_QUESTIONS.length,
      });
    }
  }, [step, user, score]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const totalPossible = useMemo(() => {
    return OBJECT_PRONOUN_QUESTIONS.reduce((acc, q) => acc + q.placeholders.length, 0);
  }, []);

  const startQuiz = () => {
    performAction(() => {
      setStep('quiz');
      setCurrentIndex(0);
      setUserAnswers({});
      setIsAnswered(false);
      setScore(0);
      setOpenDropdown(null);
    });
  };

  const handleOptionSelect = (id: string, value: string) => {
    if (isAnswered) return;
    setUserAnswers(prev => ({ ...prev, [id]: value }));
    setOpenDropdown(null);
  };

  const checkAnswer = () => {
    const currentQuestion = OBJECT_PRONOUN_QUESTIONS[currentIndex];
    let correctCount = 0;
    currentQuestion.placeholders.forEach(p => {
      const answer = userAnswers[p.id]?.toLowerCase() || "";
      if (p.correctAnswer.toLowerCase() === answer) {
        correctCount++;
      }
    });
    setScore(prev => prev + correctCount);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < OBJECT_PRONOUN_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setOpenDropdown(null);
    } else {
      setStep('results');
    }
  };

  const currentQuestion = OBJECT_PRONOUN_QUESTIONS[currentIndex];

  const renderQuestion = (question: Question) => {
    const parts = question.story.split(/(\{\d+\})/);
    return (
      <div className="bg-gray-50 dark:bg-[#121a28] p-10 rounded-[2rem] border border-gray-200 dark:border-[#424855]/10 shadow-xl w-full relative group">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <TTSButton 
            text={question.story.replace(/\{(\d+)\}/g, (match, index) => {
              const placeholder = question.placeholders[index];
              return userAnswers[placeholder.id] || '...';
            })} 
          />
        </div>
        <div className="text-gray-900 dark:text-[#e5ebfc] text-xl md:text-2xl font-headline font-bold leading-relaxed flex flex-wrap items-center justify-center gap-x-2 text-center">
          {parts.map((part, i) => {
            const match = part.match(/\{(\d+)\}/);
            if (match) {
              const placeholderIdx = parseInt(match[1]);
              const placeholder = question.placeholders[placeholderIdx];
              if (!placeholder) return null;

              const isCorrect = (userAnswers[placeholder.id] || "").toLowerCase() === placeholder.correctAnswer.toLowerCase();

              if (isAnswered) {
                return (
                  <motion.span 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={i} 
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-[#1d2636] border-2 border-transparent"
                  >
                    {isCorrect ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                        {userAnswers[placeholder.id]} <CheckCircle2 className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-2 line-through opacity-50">
                          {userAnswers[placeholder.id] || "..."}
                        </span>
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                          {placeholder.correctAnswer} <AlertCircle className="w-5 h-5" />
                        </span>
                      </span>
                    )}
                  </motion.span>
                );
              }

              return (
                <div key={i} className="relative inline-block mx-1">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === placeholder.id ? null : placeholder.id)}
                    className={`min-w-[90px] h-10 px-3 rounded-xl border-2 transition-all flex items-center justify-between gap-2 ${
                      openDropdown === placeholder.id 
                        ? 'border-[#818cf8] bg-white dark:bg-[#1d2636] shadow-lg shadow-[#818cf8]/20' 
                        : 'border-gray-200 dark:border-[#424855]/30 bg-white dark:bg-[#1d2636] hover:border-[#818cf8]/50'
                    }`}
                  >
                    <span className={userAnswers[placeholder.id] ? 'text-[#818cf8]' : 'text-gray-400'}>
                      {userAnswers[placeholder.id] || '...'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === placeholder.id ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {openDropdown === placeholder.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-32 bg-white dark:bg-[#1d2636] border border-gray-200 dark:border-[#424855]/20 rounded-2xl shadow-2xl overflow-hidden p-1 flex flex-col gap-1"
                      >
                        {placeholder.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleOptionSelect(placeholder.id, opt)}
                            className="text-center px-2 py-2 rounded-lg hover:bg-[#818cf8]/10 hover:text-[#818cf8] transition-colors font-bold text-sm"
                          >
                            {opt}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      </div>
    );
  };

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
                <div className="w-24 h-24 bg-indigo-400/10 rounded-3xl flex items-center justify-center">
                  <UserSearch className="w-12 h-12 text-indigo-400" />
                </div>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-[#e5ebfc]">
                OBJECT PRONOUN <span className="text-indigo-400">QUIZ</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12 max-w-lg mx-auto">
                Master the use of object pronouns in context. Read the stories and choose the correct pronouns to complete them.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startQuiz}
                className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
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
              className="space-y-12"
            >
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm mb-2">
                    Contextual Pronouns
                  </p>
                  <h2 className="font-headline text-3xl font-extrabold text-gray-900 dark:text-[#e5ebfc]">
                    Complete the Story
                  </h2>
                </div>
                <span className="bg-gray-100 dark:bg-[#121a28] px-6 py-3 rounded-2xl border border-gray-200 dark:border-[#424855]/20 text-lg font-bold text-indigo-400">
                  {currentIndex + 1} / {OBJECT_PRONOUN_QUESTIONS.length}
                </span>
              </div>

              <div className="min-h-[250px] flex items-center justify-center">
                {renderQuestion(currentQuestion)}
              </div>

              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-indigo-400/5 p-6 rounded-[2rem] border border-indigo-400/20"
                  >
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-[#e5ebfc] font-medium text-lg">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                      <TTSButton text={currentQuestion.explanation} className="mt-1" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-center pt-4">
                {!isAnswered ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={checkAnswer}
                    disabled={currentQuestion.placeholders.some(p => !userAnswers[p.id])}
                    className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    Check Answer
                  </motion.button>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="bg-[#91f8b8] text-[#004a29] px-12 py-5 rounded-2xl font-bold text-xl shadow-xl shadow-[#91f8b8]/20 flex items-center gap-3 transition-all"
                  >
                    {currentIndex === OBJECT_PRONOUN_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Story'}
                    <ArrowRight className="w-6 h-6" />
                  </motion.button>
                )}
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
                <div className="w-32 h-32 bg-indigo-600/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-16 h-16 text-indigo-600" />
                </div>
              </div>
              <h2 className="font-headline text-4xl font-extrabold mb-4 text-gray-900 dark:text-[#e5ebfc]">
                Quiz Completed!
              </h2>
              <div className="text-7xl font-black text-indigo-600 mb-6">
                {score} / {totalPossible}
              </div>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12">
                {score === totalPossible 
                  ? "🎉 Perfect! You've mastered object pronouns in context!" 
                  : score > totalPossible / 2 
                  ? "👍 Great job! You're doing excellent." 
                  : "📚 Keep practicing! Context is key to understanding pronouns."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
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
