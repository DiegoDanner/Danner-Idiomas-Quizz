'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, RotateCcw, ArrowRight, Users, AlertCircle, ChevronDown, Info } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TTSButton from '@/components/TTSButton';
import { saveQuizProgress } from '@/lib/progress';
import { useAuthAction } from '@/hooks/useAuthAction';
import AuthModal from '@/components/AuthModal';

interface QuizItem {
  id: string;
  correctAnswers: string[];
}

interface Question {
  text: string;
  explanation: string;
  placeholders: QuizItem[];
}

const PRONOUN_QUESTIONS: Question[] = [
  {
    text: "I can't find my keys. ⇒ I can't find {0}.",
    explanation: "Keys is plural. For things, we use it/it in the singular and they/them in the plural. Keys = they/them.",
    placeholders: [{ id: "p1", correctAnswers: ["them"] }]
  },
  {
    text: "Rachel helps the students. ⇒ {0} helps {1}.",
    explanation: "We use subject pronouns (she) before the verb (helps). We use object pronouns (them) after the verb (helps).",
    placeholders: [
      { id: "p2_1", correctAnswers: ["She"] },
      { id: "p2_2", correctAnswers: ["them"] }
    ]
  },
  {
    text: "I need to tell John the truth. ⇒ I need to tell {0} the truth.",
    explanation: "John = he/him. We use object pronouns (him) after the verb (tell).",
    placeholders: [{ id: "p3", correctAnswers: ["him"] }]
  },
  {
    text: "My dad and I love chocolate. ⇒ {0} love {1}.",
    explanation: "We use subject pronouns (we) before the verb (love). We use object pronouns (it) after the verb (love). Chocolate = it.",
    placeholders: [
      { id: "p4_1", correctAnswers: ["We"] },
      { id: "p4_2", correctAnswers: ["it"] }
    ]
  },
  {
    text: "Suzan and Tom call their daughter every day. ⇒ {0} call {1} every day.",
    explanation: "Suzan and Tom = they/them. Their daughter = she/her. We use subject pronouns (They) before the verb (call) and object pronouns (her) after the verb.",
    placeholders: [
      { id: "p5_1", correctAnswers: ["They"] },
      { id: "p5_2", correctAnswers: ["her"] }
    ]
  },
  {
    text: "I like cooking for my children. ⇒ I like cooking for {0}.",
    explanation: "My children = they/them. We use object pronouns (them) after prepositions (for).",
    placeholders: [{ id: "p6", correctAnswers: ["them"] }]
  },
  {
    text: "Give the documents to Carmen. ⇒ Give {0} to {1}.",
    explanation: "We use object pronouns (them) after the verb (give) and (her) after the preposition (to). Documents is plural, so we use they/them.",
    placeholders: [
      { id: "p7_1", correctAnswers: ["them"] },
      { id: "p7_2", correctAnswers: ["her"] }
    ]
  },
  {
    text: "Tom often plays football with my friends and me. ⇒ {0} often plays football with {1}.",
    explanation: "Tom = he/him. My friends and me = us. We use subject pronouns (He) before the verb (plays) and object pronouns (us) after the preposition (with).",
    placeholders: [
      { id: "p8_1", correctAnswers: ["He"] },
      { id: "p8_2", correctAnswers: ["us"] }
    ]
  },
  {
    text: "How old is Emma? ⇒ How old is {0}?",
    explanation: "Emma = she/her. We need a subject pronoun because in questions, the subject goes after the verb 'be'.",
    placeholders: [{ id: "p9", correctAnswers: ["she"] }]
  },
  {
    text: "I need the scissors to cut the paper. ⇒ I need {0} to cut {1}.",
    explanation: "Scissors is plural (they/them). Paper is singular (it). We use object pronouns after the verbs (need, cut).",
    placeholders: [
      { id: "p10_1", correctAnswers: ["them"] },
      { id: "p10_2", correctAnswers: ["it"] }
    ]
  }
];

const OPTIONS = ["I", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them"];

export default function PronounsQuiz() {
  const [step, setStep] = useState<'start' | 'quiz' | 'results'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();

  const totalPossible = useMemo(() => {
    return PRONOUN_QUESTIONS.reduce((acc, q) => acc + q.placeholders.length, 0);
  }, []);

  useEffect(() => {
    if (step === 'results') {
      saveQuizProgress({
        quiz_id: 'pronouns',
        score: score,
        total_questions: totalPossible
      });
    }
  }, [step, score, totalPossible]);

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
    const currentQuestion = PRONOUN_QUESTIONS[currentIndex];
    let correctCount = 0;
    currentQuestion.placeholders.forEach(p => {
      const answer = userAnswers[p.id]?.toLowerCase() || "";
      if (p.correctAnswers.some(correct => correct.toLowerCase() === answer)) {
        correctCount++;
      }
    });
    setScore(prev => prev + correctCount);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIndex < PRONOUN_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      setOpenDropdown(null);
    } else {
      setStep('results');
    }
  };

  const currentQuestion = PRONOUN_QUESTIONS[currentIndex];

  const renderQuestion = (question: Question) => {
    const parts = question.text.split(/(\{\d+\})/);
    
    // Helper to get the full correct sentence for TTS
    const getFullCorrectSentence = () => {
      return parts.map((part) => {
        const match = part.match(/\{(\d+)\}/);
        if (match) {
          const placeholderIdx = parseInt(match[1]);
          return question.placeholders[placeholderIdx]?.correctAnswers[0] || '...';
        }
        return part;
      }).join('');
    };

    return (
      <div className="bg-gray-50 dark:bg-[#121a28] p-10 rounded-[2rem] border border-gray-200 dark:border-[#424855]/10 shadow-xl w-full relative group">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <TTSButton text={getFullCorrectSentence()} />
        </div>
        <div className="text-gray-900 dark:text-[#e5ebfc] text-2xl md:text-3xl font-headline font-bold leading-relaxed flex flex-wrap items-center justify-center gap-x-2 text-center">
          {parts.map((part, i) => {
            const match = part.match(/\{(\d+)\}/);
            if (match) {
              const placeholderIdx = parseInt(match[1]);
              const placeholder = question.placeholders[placeholderIdx];
              if (!placeholder) return null;

              const isCorrect = placeholder.correctAnswers.some(
                c => c.toLowerCase() === (userAnswers[placeholder.id] || "").toLowerCase()
              );
              const primaryCorrect = placeholder.correctAnswers[0];

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
                        {userAnswers[placeholder.id]} <CheckCircle2 className="w-6 h-6" />
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-2 line-through opacity-50">
                          {userAnswers[placeholder.id] || "..."}
                        </span>
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                          {primaryCorrect} <AlertCircle className="w-6 h-6" />
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
                    className={`min-w-[100px] h-12 px-4 rounded-xl border-2 transition-all flex items-center justify-between gap-2 ${
                      openDropdown === placeholder.id 
                        ? 'border-[#bd9dff] bg-white dark:bg-[#1d2636] shadow-lg shadow-[#bd9dff]/20' 
                        : 'border-gray-200 dark:border-[#424855]/30 bg-white dark:bg-[#1d2636] hover:border-[#bd9dff]/50'
                    }`}
                  >
                    <span className={userAnswers[placeholder.id] ? 'text-[#bd9dff]' : 'text-gray-400'}>
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
                        className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-40 bg-white dark:bg-[#1d2636] border border-gray-200 dark:border-[#424855]/20 rounded-2xl shadow-2xl overflow-hidden p-1 grid grid-cols-2 gap-1"
                      >
                        {OPTIONS.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleOptionSelect(placeholder.id, opt)}
                            className="text-center px-2 py-2 rounded-lg hover:bg-[#bd9dff]/10 hover:text-[#bd9dff] transition-colors font-bold text-base"
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
                <div className="w-24 h-24 bg-[#bd9dff]/10 rounded-3xl flex items-center justify-center">
                  <Users className="w-12 h-12 text-[#bd9dff]" />
                </div>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-[#e5ebfc]">
                QUIZ ABOUT <span className="text-[#bd9dff]">PRONOUNS</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12 max-w-lg mx-auto">
                Master Subject and Object pronouns. Replace the nouns correctly to complete each sentence.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startQuiz}
                className="bg-[#bd9dff] text-[#2a0042] px-12 py-5 rounded-2xl font-bold text-xl shadow-lg shadow-[#bd9dff]/20 hover:bg-[#a885f0] transition-colors"
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
                  <p className="text-[#bd9dff] font-bold uppercase tracking-widest text-sm mb-2">
                    Subject & Object Pronouns
                  </p>
                  <h2 className="font-headline text-3xl font-extrabold text-gray-900 dark:text-[#e5ebfc]">
                    Complete the Sentence
                  </h2>
                </div>
                <span className="bg-gray-100 dark:bg-[#121a28] px-6 py-3 rounded-2xl border border-gray-200 dark:border-[#424855]/20 text-lg font-bold text-[#bd9dff]">
                  {currentIndex + 1} / {PRONOUN_QUESTIONS.length}
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
                    className="bg-[#bd9dff]/5 p-6 rounded-[2rem] border border-[#bd9dff]/20"
                  >
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-[#bd9dff] shrink-0 mt-1" />
                      <p className="text-gray-900 dark:text-[#e5ebfc] font-medium text-lg">
                        {currentQuestion.explanation}
                      </p>
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
                    className="bg-[#bd9dff] text-[#2a0042] px-12 py-5 rounded-2xl font-bold text-xl shadow-xl shadow-[#bd9dff]/20 hover:bg-[#a885f0] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
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
                    {currentIndex === PRONOUN_QUESTIONS.length - 1 ? 'Finish Quiz' : 'Next Sentence'}
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
                <div className="w-32 h-32 bg-[#91f8b8]/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-16 h-16 text-[#91f8b8]" />
                </div>
              </div>
              <h2 className="font-headline text-4xl font-extrabold mb-4 text-gray-900 dark:text-[#e5ebfc]">
                Quiz Completed!
              </h2>
              <div className="text-7xl font-black text-[#bd9dff] mb-6">
                {score} / {totalPossible}
              </div>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12">
                {score === totalPossible 
                  ? "🎉 Perfect! You've mastered English pronouns!" 
                  : score > totalPossible / 2 
                  ? "👍 Great job! You're getting the hang of it." 
                  : "📚 Keep practicing! Pronouns are essential for fluency."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="bg-[#bd9dff] text-[#2a0042] px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
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
