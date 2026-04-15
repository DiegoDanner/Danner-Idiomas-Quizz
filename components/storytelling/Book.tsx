'use client';

import { useState, useEffect } from 'react';
import { PageData, GlossaryWord } from '@/lib/stories';
import Page from './Page';
import { motion } from 'framer-motion';

interface BookProps {
  pages: PageData[];
  title: string;
  onWordClick: (id: string) => void;
  glossary: Record<string, GlossaryWord>;
  onTextChange?: (text: string) => void;
}

export default function Book({ pages, title, onWordClick, glossary, onTextChange }: BookProps) {

  const [currentSheet, setCurrentSheet] = useState(0);

  const sheets: any[] = [];

  // Sheet 0: Front=Cover, Back=Page 1 Image
  sheets.push({
    isFrontCover: true,
    front: null,
    back: pages[0],
    backType: 'image'
  });

  // Intermediate sheets
  for (let i = 0; i < pages.length - 1; i++) {
    sheets.push({
      front: pages[i],
      frontType: 'text',
      back: pages[i+1],
      backType: 'image'
    });
  }

  // Last sheet: Front=Last Page Text, Back=End
  sheets.push({
    isBackCover: true,
    front: pages[pages.length - 1],
    frontType: 'text',
    back: null
  });

  useEffect(() => {
    if (onTextChange) {
      if (currentSheet > 0 && currentSheet < sheets.length) {
        onTextChange(pages[currentSheet - 1].rawText);
      } else {
        onTextChange('');
      }
    }
  }, [currentSheet, pages, onTextChange, sheets.length]);

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
      <motion.div
        className="relative w-full h-full max-w-[96%] max-h-[96%] flex cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          x: currentSheet === 0 ? '-25%' : currentSheet === sheets.length ? '25%' : '0%'
        }}
        transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
        onClick={handleBookClick}
      >
        <div
          className="absolute inset-y-0 left-1/2 w-16 -ml-8 z-50 pointer-events-none"
          style={{
            opacity: 0.15,
            background: 'linear-gradient(to right, rgba(0,0,0,0.08), rgba(0,0,0,0.02), rgba(0,0,0,0.08))'
          }}
        ></div>

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
              <div
                className={`absolute inset-0 w-full h-full rounded-r-md pointer-events-auto shadow-[-1px_0_2px_rgba(0,0,0,0.1)] overflow-hidden ${sheet.isFrontCover ? 'bg-[#2b3d4f]' : 'bg-[#fdfbf7] dark:bg-[#121a28]'}`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent w-8 pointer-events-none" />
                {sheet.isFrontCover && (
                  <div className="w-full h-full flex items-center justify-center p-6 md:p-12">
                    <div className="text-center border border-white/20 p-6 md:p-10 rounded-sm w-full h-full flex flex-col items-center justify-center shadow-inner relative">
                      <div className="absolute inset-4 border border-white/10 pointer-events-none"></div>
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-white drop-shadow-md z-10">{title}</h1>
                      <p className="text-lg md:text-xl font-serif italic text-white/80 z-10">By Diego Danner</p>
                    </div>
                  </div>
                )}
                {sheet.front && <Page page={sheet.front} onWordClick={onWordClick} isLeftPage={false} glossary={glossary} displayType={sheet.frontType} />}
              </div>

              <div
                className={`absolute inset-0 w-full h-full rounded-l-md pointer-events-auto shadow-[1px_0_2px_rgba(0,0,0,0.1)] overflow-hidden ${sheet.isBackCover ? 'bg-[#2b3d4f]' : 'bg-[#fdfbf7] dark:bg-[#121a28]'}`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-l from-black/5 to-transparent w-8 right-0 pointer-events-none" />
                {sheet.isBackCover && !sheet.back && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    <p className="text-gray-400 dark:text-[#a5abbb] font-serif italic text-xl">The End</p>
                    <div className="w-16 h-1 mt-4 bg-[#d7ccc8]/30 rounded-full" />
                  </div>
                )}
                {sheet.back && <Page page={sheet.back} onWordClick={onWordClick} isLeftPage={true} glossary={glossary} displayType={sheet.backType} />}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
