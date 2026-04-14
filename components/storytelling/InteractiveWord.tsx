'use client';

import { useState } from 'react';
import { GlossaryWord } from '@/lib/stories';

interface InteractiveWordProps {
  wordId: string;
  text: string;
  onWordClick: (_id: string) => void;
  glossary: Record<string, GlossaryWord>;
}

export default function InteractiveWord({ wordId, text, onWordClick, glossary }: InteractiveWordProps) {
  const [isHovered, setIsHovered] = useState(false);
  const wordData = glossary[wordId];

  if (!wordData) return <span>{text}</span>;

  return (
    <span className="relative inline-block">
      <button
        className="font-bold text-[#8b5a2b] dark:text-[#c4a484] hover:text-[#5c3a21] dark:hover:text-[#e5d5c5] underline decoration-dotted decoration-2 underline-offset-4 transition-colors duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation(); // Prevent page flip if clicking word
          onWordClick(wordId);
        }}
        aria-haspopup="dialog"
      >
        {text}
      </button>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 md:w-56 p-3 bg-[#fffdf8] dark:bg-[#1d2636] border border-[#e2d9c8] dark:border-[#424855]/20 text-gray-800 dark:text-[#e5ebfc] text-sm rounded shadow-xl z-50 pointer-events-none font-serif">
          <div className="font-bold text-[#8b5a2b] dark:text-[#6cb2ff] mb-1 capitalize">{wordData.word}</div>
          <div className="text-gray-700 dark:text-[#a5abbb] text-xs leading-relaxed">{wordData.definition}</div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#e2d9c8] dark:border-t-[#424855]/20"></div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#fffdf8] dark:border-t-[#1d2636] -mt-[1px]"></div>
        </div>
      )}
    </span>
  );
}
