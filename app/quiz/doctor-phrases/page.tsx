'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle2, RotateCcw, HeartPulse, Info, Volume2, Mic } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Flashcard from '@/components/DoctorPhrases/Flashcard';
import { doctorPhrases } from '@/lib/doctor-phrases-data';
import { saveQuizProgress } from '@/lib/progress';
import { useAuthAction } from '@/hooks/useAuthAction';
import AuthModal from '@/components/AuthModal';

export default function DoctorPhrasesPage() {
  const [step, setStep] = useState<'start' | 'practice' | 'results'>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedPhrases, setCompletedPhrases] = useState<Set<number>>(new Set());
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();

  useEffect(() => {
    if (step === 'results') {
      saveQuizProgress({
        quiz_id: 'doctor-phrases',
        score: completedPhrases.size,
        total_questions: doctorPhrases.length
      });
    }
  }, [step, completedPhrases.size]);

  const startModule = () => {
    performAction(() => {
      setStep('practice');
      setCurrentIndex(0);
      setCompletedPhrases(new Set());
    });
  };

  const handleComplete = (id: number) => {
    setCompletedPhrases(prev => new Set(prev).add(id));

    // Auto-transition to results if it's the last card
    if (currentIndex === doctorPhrases.length - 1) {
      setTimeout(() => {
        setStep('results');
      }, 2500); // Give user time to see the flipped card and success feedback
    }
  };

  const handleNext = () => {
    if (currentIndex < doctorPhrases.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setStep('results');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
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
                <div className="w-24 h-24 bg-red-500/10 rounded-3xl flex items-center justify-center">
                  <HeartPulse className="w-12 h-12 text-red-500" />
                </div>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-[#e5ebfc]">
                DOCTOR <span className="text-red-500">PHRASES</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12 max-w-lg mx-auto">
                Challenge your skills with our interactive medical modules. Each phrase is designed to accelerate your fluency through immersive practice.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startModule}
                className="bg-red-500 text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
              >
                Start Practice
              </motion.button>
            </motion.div>
          )}

          {step === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col items-center space-y-8">
                {/* Progress Indicator */}
                <div className="flex items-center space-x-4 w-full max-w-md">
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-[#121a28] rounded-full overflow-hidden border border-gray-200 dark:border-[#424855]/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIndex + 1) / doctorPhrases.length) * 100}%` }}
                      className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                    />
                  </div>
                  <span className="text-xs font-mono text-gray-500 dark:text-[#a5abbb] font-bold">
                    {currentIndex + 1} / {doctorPhrases.length}
                  </span>
                </div>

                {/* Flashcard */}
                <Flashcard
                  key={doctorPhrases[currentIndex].id}
                  phrase={doctorPhrases[currentIndex]}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isFirst={currentIndex === 0}
                  isLast={currentIndex === doctorPhrases.length - 1}
                  isCompleted={completedPhrases.has(doctorPhrases[currentIndex].id)}
                  onComplete={() => handleComplete(doctorPhrases[currentIndex].id)}
                />

                {/* Instructions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="max-w-md w-full bg-gray-50 dark:bg-[#121a28] border border-gray-200 dark:border-[#424855]/10 rounded-3xl p-8 flex items-start space-x-5 shadow-sm"
                >
                  <div className="bg-red-500/10 p-3 rounded-2xl text-red-500">
                    <Info size={24} />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-[#a5abbb] space-y-3">
                    <p className="font-bold text-gray-900 dark:text-[#e5ebfc] text-base">How to practice:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        <span>Click <Volume2 size={14} className="inline text-red-500" /> to hear pronunciation</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        <span>Hold <Mic size={14} className="inline text-red-500" /> and read aloud</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        <span>Unlock the translation with your voice</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>

                <button
                  onClick={() => setStep('results')}
                  className="text-gray-500 hover:text-red-500 font-medium transition-colors"
                >
                  Finish Session
                </button>
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
                <div className="w-32 h-32 bg-red-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-16 h-16 text-red-500" />
                </div>
              </div>
              <h2 className="font-headline text-4xl font-extrabold mb-4 text-gray-900 dark:text-[#e5ebfc]">
                Practice Completed!
              </h2>
              <div className="text-6xl font-black text-red-500 mb-6">
                {completedPhrases.size} / {doctorPhrases.length}
              </div>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12">
                {completedPhrases.size === doctorPhrases.length
                  ? "Outstanding! You've mastered all the medical phrases."
                  : completedPhrases.size > doctorPhrases.length / 2
                  ? "Excellent work! You're building a strong medical vocabulary."
                  : "Good start! Keep practicing to improve your medical English."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startModule}
                  className="bg-red-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Restart Module
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
