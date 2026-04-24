'use client';

import VocabSpeedGame from '@/components/VocabSpeedGame/VocabSpeedGame';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function VocabSpeedGamePage() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0f18] transition-colors duration-300 flex flex-col">
      <Navbar />

      <div className="pt-24 flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-6 w-full mb-6">
          <Link href="/#quizzes">
            <motion.button
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 text-gray-500 hover:text-[#6cb2ff] transition-colors font-headline font-bold"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Quizzes
            </motion.button>
          </Link>
        </div>

        <div className="flex-1">
          <VocabSpeedGame />
        </div>
      </div>

      {/* Footer / Info */}
      <footer className="mt-20 py-12 border-t border-gray-100 dark:border-[#424855]/10">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 dark:text-[#a5abbb] text-sm font-headline">
          <p>© 2026 Rapid Fire Speaking. Built for English learners.</p>
          <p className="mt-2">Danner Idiomas created by Diego Danner.</p>
        </div>
      </footer>
    </main>
  );
}
