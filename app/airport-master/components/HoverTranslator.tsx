'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages } from 'lucide-react';

interface HoverTranslatorProps {
  text: string;
  translation: string;
}

export const HoverText: React.FC<HoverTranslatorProps> = ({ text, translation }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverTimer.current = setTimeout(() => {
      setShowTranslation(true);
    }, 2000);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTranslation(false);
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current);
      }
    };
  }, []);

  return (
    <span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative cursor-help inline-block decoration-slate-600/50 underline-offset-4 decoration-dashed hover:text-sky-300 transition-colors"
    >
      {text}

      <AnimatePresence>
        {showTranslation && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs z-50 pointer-events-none"
          >
            <div className="bg-slate-900 border border-slate-700 shadow-xl rounded-lg p-3 flex gap-3 text-left">
              <div className="bg-sky-950 p-1.5 rounded-md h-fit shrink-0">
                <Languages className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-xs font-medium text-slate-200">
                {translation}
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-slate-900 border-b border-r border-slate-700 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};
