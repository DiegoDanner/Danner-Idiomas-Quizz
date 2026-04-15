'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlossaryWord } from '@/lib/stories';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  glossary: Record<string, GlossaryWord>;
  onWordClick: (id: string) => void;
}

export default function GlossaryModal({ isOpen, onClose, glossary, onWordClick }: GlossaryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-[#fdfbf7] dark:bg-[#121a28] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-gray-100 dark:border-[#424855]/20 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc]">Story Glossary</h2>
                <p className="text-sm text-gray-500 dark:text-[#a5abbb]">Click any word to see its translation and hear pronunciation</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-[#1d2636] rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(glossary).map(([id, word]) => (
                  <button
                    key={id}
                    onClick={() => onWordClick(id)}
                    className="flex flex-col items-start p-4 rounded-xl border border-gray-100 dark:border-[#424855]/10 hover:border-[#6cb2ff] hover:bg-[#6cb2ff]/5 transition-all text-left group"
                  >
                    <span className="text-lg font-bold text-gray-900 dark:text-[#e5ebfc] group-hover:text-[#6cb2ff]">{word.word}</span>
                    <span className="text-sm text-[#6cb2ff] italic mb-1">{word.pronunciation}</span>
                    <span className="text-sm text-gray-600 dark:text-[#a5abbb] line-clamp-2">{word.definition}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
