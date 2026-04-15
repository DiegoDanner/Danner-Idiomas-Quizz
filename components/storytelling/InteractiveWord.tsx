'use client';

import { GlossaryWord } from '@/lib/stories';

interface InteractiveWordProps {
  word: string;
  glossaryKey?: string;
  onWordClick: (id: string) => void;
}

export default function InteractiveWord({ word, glossaryKey, onWordClick }: InteractiveWordProps) {
  if (!glossaryKey) return <span className="mx-0.5">{word}</span>;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onWordClick(glossaryKey);
      }}
      className="inline-block mx-0.5 px-0.5 rounded-sm bg-amber-100/50 dark:bg-amber-900/30 border-b-2 border-amber-400/50 hover:bg-amber-200/50 dark:hover:bg-amber-800/50 transition-colors cursor-pointer"
    >
      {word}
    </button>
  );
}
