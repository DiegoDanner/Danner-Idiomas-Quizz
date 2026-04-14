'use client';

import { useState } from 'react';
import { Search, Book, Frown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import QuizCard from '@/components/QuizCard';
import { stories } from '@/lib/stories';

export default function StorytellingLibrary() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#121a28] transition-colors text-gray-600 dark:text-[#a5abbb]">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-[#e5ebfc]">
              Storytelling <span className="text-[#6cb2ff]">Library</span>
            </h1>
          </div>
          <p className="text-gray-600 dark:text-[#a5abbb] max-w-2xl text-lg">
            Immerse yourself in stories designed to improve your vocabulary and comprehension. Click on highlighted words to learn their meaning.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-10 max-w-2xl relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 dark:text-[#a5abbb]" />
          </div>
          <input
            type="text"
            placeholder="Search for a story..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#121a28] border border-gray-200 dark:border-[#424855]/20 rounded-xl text-gray-900 dark:text-[#e5ebfc] placeholder:text-gray-400 dark:placeholder:text-[#a5abbb]/50 focus:outline-none focus:ring-2 focus:ring-[#6cb2ff]/50 focus:border-[#6cb2ff] transition-all font-headline"
          />
        </div>

        {/* Stories Grid */}
        <div>
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => (
                <QuizCard
                  key={story.id}
                  title={story.title}
                  description={story.description}
                  icon={Book}
                  iconColor="text-amber-500"
                  iconBg="bg-amber-500/10"
                  actionText="Read Story"
                  actionColor="text-amber-500"
                  href={`/storytelling/${story.id}`}
                  skipAuth={true}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-[#121a28] rounded-full flex items-center justify-center mb-6">
                <Frown className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc] mb-2">No stories found</h3>
              <p className="text-gray-500 dark:text-[#a5abbb]">We couldn&apos;t find any stories matching &quot;{searchQuery}&quot;. Try a different search term.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-6 text-[#6cb2ff] font-bold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
