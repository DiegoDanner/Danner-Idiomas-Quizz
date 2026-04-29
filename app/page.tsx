'use client';

import { useState } from 'react';
import { 
  Search, 
  Globe, 
  Sparkles, 
  Users, 
  ArrowLeftRight, 
  Puzzle, 
  UserSearch, 
  Mic, 
  HelpCircle, 
  Zap,
  Frown,
  HeartPulse,
  Calendar,
  BookOpen
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import QuizCard from '@/components/QuizCard';
import ProgressSection from '@/components/ProgressSection';

const QUIZZES = [
  {
    title: 'Quiz about English',
    description: 'Master the fundamentals of the global language. Practice grammar, vocabulary, and common phrases.',
    icon: Globe,
    iconColor: 'text-[#6cb2ff]',
    iconBg: 'bg-[#6cb2ff]/10',
    actionText: 'Start Module',
    actionColor: 'text-[#6cb2ff]',
    href: '/quiz/english',
  },
  {
    title: 'Quiz about Verb To Be',
    description: 'The cornerstone of English communication. Perfect your usage of am, is, and are in various contexts.',
    icon: Sparkles,
    iconColor: 'text-[#91f8b8]',
    iconBg: 'bg-[#91f8b8]/10',
    actionText: 'Practice Now',
    actionColor: 'text-[#91f8b8]',
    href: '/quiz/verb-to-be',
  },
  {
    title: 'Quiz about Pronouns',
    description: 'Who, what, and whom. Clarify subject and object pronouns to make your speech more fluid and natural.',
    icon: Users,
    iconColor: 'text-[#bd9dff]',
    iconBg: 'bg-[#bd9dff]/10',
    actionText: 'Begin Quiz',
    actionColor: 'text-[#bd9dff]',
    href: '/quiz/pronouns',
  },
  {
    title: 'Quiz about Comparative and Superlative',
    description: 'Learn how to describe differences. Faster, stronger, better — master the art of comparison and superlatives.',
    icon: ArrowLeftRight,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-400/10',
    actionText: 'Review Rules',
    actionColor: 'text-amber-400',
    href: '/quiz/comparative-superlative',
  },
  {
    title: 'Vocabulary Memory Match',
    description: 'Test your memory while expanding your lexicon. Fun matching games for business, travel, and more.',
    icon: Puzzle,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-400/10',
    actionText: 'Play Game',
    actionColor: 'text-pink-400',
    href: '/quiz/memory-match',
  },
  {
    title: 'Object Pronoun Quiz',
    description: 'Focus on me, you, him, her, it, us, and them. Perfect your object pronoun placement in sentences.',
    icon: UserSearch,
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-400/10',
    actionText: 'Start Quiz',
    actionColor: 'text-indigo-400',
    href: '/quiz/object-pronouns',
  },
  {
    title: 'Third Person Quiz',
    description: "Don't forget the 's'! Master verb conjugations for he, she, and it in the simple present tense.",
    icon: Mic,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-400/10',
    actionText: 'Check Grammar',
    actionColor: 'text-cyan-400',
    href: '/quiz/third-person',
  },
  {
    title: 'Questions to Practice',
    description: 'Learn how to form various question types correctly. Practice auxiliaries and question words.',
    icon: HelpCircle,
    iconColor: 'text-[#6cb2ff]',
    iconBg: 'bg-[#6cb2ff]/10',
    actionText: 'Practice Now',
    actionColor: 'text-[#6cb2ff]',
    href: '/quiz/practice-questions',
  },
  {
    title: 'Daily Blitz',
    description: 'A mix of everything! Keep your streak alive with a personalized 5-minute quiz session.',
    icon: Zap,
    iconColor: 'text-[#002442]',
    iconBg: 'bg-white/20',
    actionText: 'Claim XP',
    actionColor: 'text-[#002442]',
    isHighlight: true,
    href: '/quiz/daily-blitz',
  },
  {
    title: 'Stroop Test Challenge',
    description: 'Test your cognitive speed! Identify the color of the text, not the word itself. High-speed brain training.',
    icon: Zap,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    actionText: 'Start Test',
    actionColor: 'text-blue-500',
    href: '/quiz/stroop-test',
  },
  {
    title: 'Doctor Phrases',
    description: 'Challenge your skills with our interactive medical modules. Each phrase is designed to accelerate your fluency through immersive practice.',
    icon: HeartPulse,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-500/10',
    actionText: 'Start Practice',
    actionColor: 'text-red-500',
    href: '/quiz/doctor-phrases',
  },
  {
    title: 'Months of the Year',
    description: 'Master the months of the year in English with our immersive 3D road challenge. Practice your pronunciation and speed.',
    icon: Calendar,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-500/10',
    actionText: 'Start Challenge',
    actionColor: 'text-orange-500',
    href: '/quiz/months-of-the-year',
  },
  {
    title: 'Sentences to Practice',
    description: 'Master common English sentences with interactive flashcards. Expand your vocabulary and improve your fluency.',
    icon: BookOpen,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    actionText: 'Open Flashcards',
    actionColor: 'text-emerald-500',
    href: '/quiz/practice-sentences',
  },
  {
    title: 'Storytelling Library',
    description: 'Immerse yourself in captivating stories. Improve your comprehension and vocabulary through interactive reading.',
    icon: BookOpen,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-500/10',
    actionText: 'Browse Stories',
    actionColor: 'text-purple-500',
    href: '/storytelling',
    skipAuth: true,
  },
  {
    title: 'Vocab Speed Game',
    description: 'Challenge your vocabulary speed! Select a category and say as many words as you can before time runs out.',
    icon: Zap,
    iconColor: 'text-yellow-500',
    iconBg: 'bg-yellow-500/10',
    actionText: 'Start Game',
    actionColor: 'text-yellow-500',
    href: '/quiz/vocab-speed-game',
    skipAuth: true,
  },
  {
    title: 'Vocab Cards',
    description: 'Learn vocabulary through interactive sorting cards. Drag and drop words into their correct categories.',
    icon: Puzzle,
    iconColor: 'text-[#6cb2ff]',
    iconBg: 'bg-[#6cb2ff]/10',
    actionText: 'Play Game',
    actionColor: 'text-[#6cb2ff]',
    href: '/quiz/vocab-cards',
    skipAuth: true,
  },
];


export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuizzes = QUIZZES.filter(quiz => 
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <header className="mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-[#e5ebfc]">
            Knowledge <span className="text-[#6cb2ff]">Quizzes</span>
          </h1>
          <p className="text-gray-600 dark:text-[#a5abbb] max-w-2xl text-lg">
            Challenge your skills with our interactive modules. Each quiz is designed to accelerate your fluency through immersive practice.
          </p>
        </header>

        {/* Search Bar */}
        <div className="mb-10 max-w-2xl relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400 dark:text-[#a5abbb]" />
          </div>
          <input 
            type="text" 
            placeholder="Search for a quiz..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#121a28] border border-gray-200 dark:border-[#424855]/20 rounded-xl text-gray-900 dark:text-[#e5ebfc] placeholder:text-gray-400 dark:placeholder:text-[#a5abbb]/50 focus:outline-none focus:ring-2 focus:ring-[#6cb2ff]/50 focus:border-[#6cb2ff] transition-all font-headline"
          />
        </div>

        {/* Bento Grid Quiz Modules */}
        <div id="quizzes">
          {filteredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz, index) => (
                <QuizCard key={index} {...quiz} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-[#121a28] rounded-full flex items-center justify-center mb-6">
                <Frown className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc] mb-2">No quizzes found</h3>
              <p className="text-gray-500 dark:text-[#a5abbb]">We couldn&apos;t find any quizzes matching &quot;{searchQuery}&quot;. Try a different search term.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-[#6cb2ff] font-bold hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Progress Section */}
        <div id="stats">
          <ProgressSection />
        </div>
      </main>
    </>
  );
}
