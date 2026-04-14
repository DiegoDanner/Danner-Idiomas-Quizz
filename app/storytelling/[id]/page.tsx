'use client';

import { useState, use } from 'react';
import { BookA, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Book from '@/components/storytelling/Book';
import WordModal from '@/components/storytelling/WordModal';
import GlossaryModal from '@/components/storytelling/GlossaryModal';
import { stories } from '@/lib/stories';
import { notFound } from 'next/navigation';

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const story = stories.find(s => s.id === id);

  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  if (!story) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#080e1a] transition-colors duration-300">
      <Navbar />

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center gap-8">
        <div className="w-full flex justify-between items-center">
          <Link
            href="/storytelling"
            className="flex items-center gap-2 text-gray-600 dark:text-[#a5abbb] hover:text-[#6cb2ff] transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Library
          </Link>

          <button
            onClick={() => setIsGlossaryOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6cb2ff] text-[#002442] font-bold rounded-xl shadow-lg shadow-[#6cb2ff]/20 hover:bg-[#58a2f0] transition-all"
          >
            <BookA className="w-5 h-5" />
            Open Glossary
          </button>
        </div>

        <div className="text-center space-y-2 mb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-[#e5ebfc] font-headline">
            {story.title}
          </h1>
          <p className="text-gray-500 dark:text-[#a5abbb]">By {story.author}</p>
        </div>

        <Book
          pages={story.pages}
          title={story.title}
          onWordClick={setActiveWordId}
          glossary={story.glossary}
        />

        <WordModal
          wordId={activeWordId}
          onClose={() => setActiveWordId(null)}
          glossary={story.glossary}
        />

        <GlossaryModal
          isOpen={isGlossaryOpen}
          onClose={() => setIsGlossaryOpen(false)}
          onWordClick={setActiveWordId}
          glossary={story.glossary}
        />
      </main>
    </div>
  );
}
