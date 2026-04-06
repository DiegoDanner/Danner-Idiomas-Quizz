'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages } from 'lucide-react';
import { dictionary } from '@/lib/dictionary';

export default function HoverTranslator() {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastWordRef = useRef<string | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const word = getWordAtPoint(e.clientX, e.clientY);
      
      if (word && word.length > 1) {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (cleanWord !== lastWordRef.current) {
          if (timerRef.current) clearTimeout(timerRef.current);
          lastWordRef.current = cleanWord;
          
          // Small delay to ensure user is actually hovering/pausing
          timerRef.current = setTimeout(() => {
            const localTranslation = dictionary[cleanWord];
            if (localTranslation) {
              setHoveredWord(word);
              setTranslation(localTranslation);
              setPosition({ x: e.clientX, y: e.clientY });
            } else {
              setHoveredWord(null);
              setTranslation(null);
            }
          }, 150);
        }
      } else {
        if (timerRef.current) clearTimeout(timerRef.current);
        lastWordRef.current = null;
        setHoveredWord(null);
        setTranslation(null);
      }
    };

    const getWordAtPoint = (x: number, y: number) => {
      const target = document.elementFromPoint(x, y) as HTMLElement;
      if (!target || target.closest('button') || target.closest('input') || target.closest('textarea')) {
        return null;
      }

      let range: Range | null = null;

      if ((document as any).caretRangeFromPoint) {
        range = (document as any).caretRangeFromPoint(x, y);
      } else if ((document as any).caretPositionFromPoint) {
        const pos = (document as any).caretPositionFromPoint(x, y);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.setEnd(pos.offsetNode, pos.offset);
        }
      }

      if (range && range.startContainer.nodeType === Node.TEXT_NODE) {
        const textNode = range.startContainer;
        const offset = range.startOffset;
        const text = textNode.textContent || '';
        
        // Find word boundaries
        const before = text.substring(0, offset).match(/[a-zA-Z]+$/);
        const after = text.substring(offset).match(/^[a-zA-Z]+/);
        
        if (!before && !after) return null;

        const start = before ? offset - before[0].length : offset;
        const end = after ? offset + after[0].length : offset;
        const word = text.substring(start, end);

        // Precision check: verify if the point is actually within the word's bounds
        const wordRange = document.createRange();
        wordRange.setStart(textNode, start);
        wordRange.setEnd(textNode, end);
        
        const rects = wordRange.getClientRects();
        let isInside = false;
        for (let i = 0; i < rects.length; i++) {
          const rect = rects[i];
          if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            isInside = true;
            break;
          }
        }

        return isInside ? word : null;
      }
      return null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {hoveredWord && translation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          translate="no"
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y - 10,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className="bg-white dark:bg-[#1d2636] border border-gray-200 dark:border-[#424855]/30 rounded-lg shadow-2xl p-2 flex items-center gap-2 min-w-[100px] -translate-x-1/2 -translate-y-full mb-2"
        >
          <div className="bg-[#6cb2ff]/10 p-1 rounded-md">
            <Languages className="w-3.5 h-3.5 text-[#6cb2ff]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{hoveredWord}</span>
              <span className="text-gray-300 dark:text-gray-600">→</span>
              <span className="text-xs font-bold text-[#91f8b8]">{translation}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
