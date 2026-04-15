'use client';

import Image from 'next/image';
import { PageData, GlossaryWord } from '@/lib/stories';
import InteractiveWord from './InteractiveWord';

interface PageProps {
  page: PageData;
  onWordClick: (id: string) => void;
  isLeftPage?: boolean;
  glossary: Record<string, GlossaryWord>;
  displayType?: 'image' | 'text';
}

export default function Page({ page, onWordClick, isLeftPage, glossary, displayType }: PageProps) {
  const isImageOnly = displayType === 'image';

  return (
    <div className="w-full h-full flex flex-col bg-[#fdfbf7] dark:bg-[#121a28]">
      {isImageOnly ? (
        <div className="relative w-full h-full">
          <Image
            src={page.imageUrl}
            alt={page.imageAlt || "Story Illustration"}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex-1 p-6 md:p-12 flex flex-col justify-center overflow-y-auto">
          <div className="max-w-prose mx-auto">
            <div className="text-lg md:text-xl lg:text-2xl leading-relaxed font-serif text-gray-800 dark:text-[#e5ebfc]">
              {page.content.map((segment: any, idx: number) => (
                <InteractiveWord
                  key={idx}
                  word={segment.text}
                  glossaryKey={segment.wordId}
                  onWordClick={onWordClick}
                />
              ))}
            </div>
          </div>
          <div className={`absolute bottom-6 ${isLeftPage ? 'left-8' : 'right-8'} text-gray-400 font-serif text-sm`}>
            {page.id}
          </div>
        </div>
      )}
    </div>
  );
}
