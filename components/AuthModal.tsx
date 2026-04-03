'use client';

import { motion, AnimatePresence } from 'motion/react';
import { LogIn, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-[#121a28] p-8 rounded-[2.5rem] border border-gray-200 dark:border-[#424855]/10 shadow-2xl z-[101]"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#6cb2ff]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-10 h-10 text-[#6cb2ff]" />
              </div>
              <h2 className="font-headline text-3xl font-extrabold text-gray-900 dark:text-[#e5ebfc] mb-4">
                Login Required
              </h2>
              <p className="text-gray-600 dark:text-[#a5abbb] mb-8">
                Please sign in to start the quiz and save your progress. Redirecting to login page...
              </p>
              <div className="w-full h-1 bg-gray-100 dark:bg-[#1d2636] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="h-full bg-[#6cb2ff]"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
