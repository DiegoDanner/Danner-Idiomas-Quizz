'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Languages,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { useAuthAction } from '@/hooks/useAuthAction';
import { practiceSentences, PracticeSentence } from '@/lib/practice-sentences-data';
import PracticeFlashcard from '@/components/PracticeSentences/PracticeFlashcard';

export default function PracticeSentencesPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startLanguage, setStartLanguage] = useState<'english' | 'portuguese'>('english');
  const [cards, setCards] = useState<PracticeSentence[]>(practiceSentences);
  const { showAuthModal, setShowAuthModal } = useAuthAction();

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleLanguage = () => {
    setStartLanguage((prev) => (prev === 'english' ? 'portuguese' : 'english'));
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-white dark:bg-[#080e1a] transition-colors duration-300">
      <Navbar />

      <main className="pt-28 pb-20 px-6 max-w-4xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#6cb2ff]/10 text-[#6cb2ff] rounded-full text-sm font-bold mb-4"
          >
            <BookOpen size={16} />
            <span>Practice Module</span>
          </motion.div>
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-[#e5ebfc] mb-4">
            Sentences to <span className="text-[#6cb2ff]">Practice</span>
          </h1>
          <p className="text-gray-600 dark:text-[#a5abbb] max-w-lg mx-auto">
            Expand your vocabulary and master common English sentences through interactive flashcards.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-[#121a28] text-gray-900 dark:text-[#e5ebfc] rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-[#1d2636] transition-all border border-gray-200 dark:border-[#424855]/10"
          >
            <Languages className="w-5 h-5 text-[#6cb2ff]" />
            <span>{startLanguage === 'english' ? 'EN → PT' : 'PT → EN'}</span>
          </button>
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-[#121a28] text-gray-900 dark:text-[#e5ebfc] rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-[#1d2636] transition-all border border-gray-200 dark:border-[#424855]/10"
          >
            <Shuffle className="w-5 h-5 text-[#6cb2ff]" />
            <span>Shuffle</span>
          </button>
        </div>

        {/* Flashcard Container */}
        <div className="w-full flex justify-center mb-10">
          <PracticeFlashcard
            key={`${currentCard.id}-${startLanguage}`}
            sentence={currentCard}
            startLanguage={startLanguage}
          />
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between w-full max-w-md bg-gray-50 dark:bg-[#121a28] p-4 rounded-[2rem] border border-gray-200 dark:border-[#424855]/10 shadow-sm">
          <button
            onClick={handlePrev}
            className="p-4 rounded-2xl bg-white dark:bg-[#1d2636] text-gray-900 dark:text-[#e5ebfc] shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-[#424855]/10"
            aria-label="Previous card"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-[#e5ebfc]">
              {currentIndex + 1}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">
              of {cards.length}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="p-4 rounded-2xl bg-white dark:bg-[#1d2636] text-gray-900 dark:text-[#e5ebfc] shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-[#424855]/10"
            aria-label="Next card"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Footer Link */}
        <Link href="/" className="mt-12 flex items-center gap-2 text-gray-500 hover:text-[#6cb2ff] font-bold transition-colors">
          <ArrowLeft size={18} />
          <span>Back to Menu</span>
        </Link>
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
