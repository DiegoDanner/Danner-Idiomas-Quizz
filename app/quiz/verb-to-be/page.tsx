'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, RotateCcw, ArrowRight, Sparkles, AlertCircle, ChevronDown } from 'lucide-react';
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

interface DialogueLine {
  speaker: string;
  text: string;
  placeholders: QuizItem[];
}

interface Conversation {
  title: string;
  dialogue: DialogueLine[];
}

const CONVERSATIONS: Conversation[] = [
  {
    title: "1. Conversation at the Cafe",
    dialogue: [
      {
        speaker: "A",
        text: "{0} you from Canada?",
        placeholders: [{ id: "c1_1", correctAnswers: ["Are"] }]
      },
      {
        speaker: "B",
        text: "No, I {0} not. I {1} from Ireland.",
        placeholders: [
          { id: "c1_2", correctAnswers: ["am", "'m"] },
          { id: "c1_3", correctAnswers: ["am", "'m"] }
        ]
      },
      {
        speaker: "A",
        text: "Oh, that {0} interesting!",
        placeholders: [{ id: "c1_4", correctAnswers: ["is", "'s"] }]
      }
    ]
  },
  {
    title: "2. Weekend Plans",
    dialogue: [
      {
        speaker: "A",
        text: "Where {0} your brother and sister?",
        placeholders: [{ id: "c2_1", correctAnswers: ["are"] }]
      },
      {
        speaker: "B",
        text: "They {0} at the park.",
        placeholders: [{ id: "c2_2", correctAnswers: ["are", "'re"] }]
      },
      {
        speaker: "A",
        text: "What about your mom?",
        placeholders: []
      },
      {
        speaker: "B",
        text: "She {0} at home. I think she {1} cooking lunch.",
        placeholders: [
          { id: "c2_3", correctAnswers: ["is", "'s"] },
          { id: "c2_4", correctAnswers: ["is", "'s"] }
        ]
      }
    ]
  }
];

const OPTIONS = ["am", "is", "are", "'m", "'s", "'re"];

export default function VerbToBeQuiz() {
  const [step, setStep] = useState<'start' | 'quiz' | 'results'>('start');
  const [currentConvIndex, setCurrentConvIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isLineChecked, setIsLineChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();

  const flatLines = useMemo(() => {
    return CONVERSATIONS.flatMap((conv, cIdx) => 
      conv.dialogue.map((line, lIdx) => ({ ...line, convTitle: conv.title, cIdx, lIdx }))
    );
  }, []);

  const totalPossible = useMemo(() => {
    return flatLines.reduce((acc, line) => acc + line.placeholders.length, 0);
  }, [flatLines]);

  useEffect(() => {
    if (step === 'results') {
      saveQuizProgress({
        quiz_id: 'verb-to-be',
        score: score,
        total_questions: totalPossible
      });
    }
  }, [step, score, totalPossible]);

  const startQuiz = () => {
    performAction(() => {
      setStep('quiz');
      setCurrentConvIndex(0);
      setCurrentLineIndex(0);
      setUserAnswers({});
      setIsLineChecked(false);
      setScore(0);
      setOpenDropdown(null);
    });
  };

  const handleOptionSelect = (id: string, value: string) => {
    if (isLineChecked) return;
    setUserAnswers(prev => ({ ...prev, [id]: value }));
    setOpenDropdown(null);
  };

  const checkLine = () => {
    const currentLine = flatLines[currentLineIndex];
    let lineCorrect = 0;
    currentLine.placeholders.forEach(p => {
      const answer = userAnswers[p.id]?.toLowerCase() || "";
      if (p.correctAnswers.some(correct => correct.toLowerCase() === answer)) {
        lineCorrect++;
      }
    });
    setScore(prev => prev + lineCorrect);
    setIsLineChecked(true);
  };

  const nextLine = () => {
    if (currentLineIndex < flatLines.length - 1) {
      setCurrentLineIndex(prev => prev + 1);
      setIsLineChecked(false);
      setOpenDropdown(null);
    } else {
      setStep('results');
    }
  };

  const currentLine = flatLines[currentLineIndex];

  const renderLine = (line: typeof flatLines[0]) => {
    const parts = line.text.split(/(\{\d+\})/);
    
    // Helper to get the full correct sentence for TTS
    const getFullCorrectSentence = () => {
      return parts.map((part) => {
        const match = part.match(/\{(\d+)\}/);
        if (match) {
          const placeholderIdx = parseInt(match[1]);
          return line.placeholders[placeholderIdx]?.correctAnswers[0] || '...';
        }
        return part;
      }).join('');
    };

    return (
      <div className="flex gap-4 items-start bg-gray-50 dark:bg-[#121a28] p-10 rounded-[2rem] border border-gray-200 dark:border-[#424855]/10 shadow-xl relative group">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <TTSButton text={getFullCorrectSentence()} />
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#6cb2ff]/10 flex items-center justify-center shrink-0">
          <span className="font-black text-2xl text-[#6cb2ff]">{line.speaker}</span>
        </div>
        <div className="text-gray-900 dark:text-[#e5ebfc] text-2xl md:text-3xl font-headline font-bold leading-relaxed flex flex-wrap items-center gap-x-2">
          {parts.map((part, i) => {
            const match = part.match(/\{(\d+)\}/);
            if (match) {
              const placeholderIdx = parseInt(match[1]);
              const placeholder = line.placeholders[placeholderIdx];
              if (!placeholder) return null;

              const isCorrect = placeholder.correctAnswers.some(
                c => c.toLowerCase() === (userAnswers[placeholder.id] || "").toLowerCase()
              );
              const primaryCorrect = placeholder.correctAnswers[0];

              if (isLineChecked) {
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
                    className={`min-w-[80px] h-12 px-4 rounded-xl border-2 transition-all flex items-center justify-between gap-2 ${
                      openDropdown === placeholder.id 
                        ? 'border-[#6cb2ff] bg-white dark:bg-[#1d2636] shadow-lg shadow-[#6cb2ff]/20' 
                        : 'border-gray-200 dark:border-[#424855]/30 bg-white dark:bg-[#1d2636] hover:border-[#6cb2ff]/50'
                    }`}
                  >
                    <span className={userAnswers[placeholder.id] ? 'text-[#6cb2ff]' : 'text-gray-400'}>
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
                        className="absolute z-50 top-full left-0 mt-2 w-32 bg-white dark:bg-[#1d2636] border border-gray-200 dark:border-[#424855]/20 rounded-2xl shadow-2xl overflow-hidden p-1"
                      >
                        {OPTIONS.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleOptionSelect(placeholder.id, opt)}
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#6cb2ff]/10 hover:text-[#6cb2ff] transition-colors font-bold text-lg"
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
                <div className="w-24 h-24 bg-[#91f8b8]/10 rounded-3xl flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-[#91f8b8]" />
                </div>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-[#e5ebfc]">
                QUIZ: THE VERB <span className="text-[#91f8b8]">&quot;TO BE&quot;</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12 max-w-lg mx-auto">
                Complete the conversations by selecting the correct form of the verb &quot;to be&quot;. One sentence at a time!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startQuiz}
                className="bg-[#91f8b8] text-[#004a29] px-12 py-5 rounded-2xl font-bold text-xl shadow-lg shadow-[#91f8b8]/20 hover:bg-[#82e9aa] transition-colors"
              >
                Start Quiz
              </motion.button>
            </motion.div>
          )}

          {step === 'quiz' && currentLine && (
            <motion.div
              key={currentLineIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[#6cb2ff] font-bold uppercase tracking-widest text-sm mb-2">
                    {currentLine.convTitle}
                  </p>
                  <h2 className="font-headline text-3xl font-extrabold text-gray-900 dark:text-[#e5ebfc]">
                    Complete the Sentence
                  </h2>
                </div>
                <span className="bg-gray-100 dark:bg-[#121a28] px-6 py-3 rounded-2xl border border-gray-200 dark:border-[#424855]/20 text-lg font-bold text-[#6cb2ff]">
                  {currentLineIndex + 1} / {flatLines.length}
                </span>
              </div>

              <div className="min-h-[300px] flex items-center justify-center">
                {renderLine(currentLine)}
              </div>

              <div className="flex justify-center pt-8">
                {!isLineChecked ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={checkLine}
                    disabled={currentLine.placeholders.some(p => !userAnswers[p.id])}
                    className="bg-[#6cb2ff] text-[#002442] px-12 py-5 rounded-2xl font-bold text-xl shadow-xl shadow-[#6cb2ff]/20 hover:bg-[#58a2f0] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    Check Answer
                  </motion.button>
                ) : (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextLine}
                    className="bg-[#91f8b8] text-[#004a29] px-12 py-5 rounded-2xl font-bold text-xl shadow-xl shadow-[#91f8b8]/20 flex items-center gap-3 transition-all"
                  >
                    {currentLineIndex === flatLines.length - 1 ? 'Finish Quiz' : 'Next Sentence'}
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
              <div className="text-7xl font-black text-[#6cb2ff] mb-6">
                {score} / {totalPossible}
              </div>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12">
                {score === totalPossible 
                  ? "🎉 Excellent! You got everything right!" 
                  : score > totalPossible / 2 
                  ? "👍 Good job! Keep practicing." 
                  : "🤔 Keep trying! Practice makes perfect."}
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
