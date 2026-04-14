'use client';

import { useState } from 'react';
import { PageData, GlossaryWord } from '@/lib/stories';
import Page from './Page';
import { motion } from 'framer-motion';

interface BookProps {
  pages: PageData[];
  title: string;
  onWordClick: (id: string) => void;
  glossary: Record<string, GlossaryWord>;
}

export default function Book({ pages, title, onWordClick, glossary }: BookProps) {

  const [currentSheet, setCurrentSheet] = useState(0);

  const sheets: any[] = [];

  // Front Cover
  sheets.push({
    isFrontCover: true,
    front: null,
    back: null,
  });

  for (let i = 0; i < pages.length; i += 2) {
    sheets.push({
      front: pages[i],
      back: pages[i + 1] || null,
    });
  }

  // Back Cover
  sheets.push({
    isBackCover: true,
    front: null,
    back: null,
  });

  const turnNext = () => {
    if (currentSheet < sheets.length) {
      setCurrentSheet(prev => prev + 1);
    }
  };

  const turnPrev = () => {
    if (currentSheet > 0) {
      setCurrentSheet(prev => prev - 1);
    }
  };

  const handleBookClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      turnPrev();
    } else {
      turnNext();
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto aspect-[1.2/1] sm:aspect-[1.5/1] md:aspect-[2/1] [perspective:2500px] flex items-center justify-center p-2 md:p-8">
      {/* Book Container */}
      <motion.div
        className="relative w-full h-full max-w-[96%] max-h-[96%] flex cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          x: currentSheet === 0 ? '-25%' : currentSheet === sheets.length ? '25%' : '0%'
        }}
        transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
        onClick={handleBookClick}
      >

        {/* Center Fold Shadow */}
        <div
          className="absolute inset-y-0 left-1/2 w-16 -ml-8 z-50 pointer-events-none"
          style={{
            opacity: 0.15,
            background: 'linear-gradient(to right, rgba(0,0,0,0.08), rgba(0,0,0,0.02), rgba(0,0,0,0.08))'
          }}
        ></div>

        {/* Sheets */}
        {sheets.map((sheet, index) => {
          const isFlipped = currentSheet > index;
          const zIndex = isFlipped ? index : sheets.length - index;

          return (
            <motion.div
              key={index}
              className="absolute top-0 right-0 w-1/2 h-full origin-left pointer-events-none"
              initial={false}
              animate={{ rotateY: isFlipped ? -180 : 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
              style={{
                zIndex,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Front Face */}
              <div
                className={`absolute inset-0 w-full h-full rounded-r-md pointer-events-auto shadow-[-1px_0_2px_rgba(0,0,0,0.1)] overflow-hidden ${sheet.isFrontCover ? 'bg-[#3e2723] dark:bg-[#1a0f0d]' : 'bg-[#fdfbf7] dark:bg-[#121a28]'}`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent w-8 pointer-events-none" />
                {sheet.isFrontCover && (
                  <div className="w-full h-full flex items-center justify-center p-6 md:p-12">
                    <div className="text-center border-4 border-[#d7ccc8]/30 dark:border-[#d7ccc8]/10 p-6 md:p-10 rounded-sm w-full h-full flex flex-col items-center justify-center shadow-inner">
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-[#d7ccc8]">{title}</h1>
                      <p className="text-lg md:text-xl font-serif italic text-[#bcaaa4]">Interactive Storybook</p>
                    </div>
                  </div>
                )}
                {sheet.front && <Page page={sheet.front} onWordClick={onWordClick} isLeftPage={false} glossary={glossary} />}
              </div>

              {/* Back Face */}
              <div
                className={`absolute inset-0 w-full h-full rounded-l-md pointer-events-auto shadow-[1px_0_2px_rgba(0,0,0,0.1)] overflow-hidden ${sheet.isBackCover ? 'bg-[#3e2723] dark:bg-[#1a0f0d]' : 'bg-[#fdfbf7] dark:bg-[#121a28]'}`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-l from-black/5 to-transparent w-8 right-0 pointer-events-none" />
                {sheet.isBackCover && (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/5"></div>
                  </div>
                )}
                {sheet.back && <Page page={sheet.back} onWordClick={onWordClick} isLeftPage={true} glossary={glossary} />}
                {!sheet.back && !sheet.isBackCover && (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <p className="text-gray-400 font-serif italic">End of Story</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
