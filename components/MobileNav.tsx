'use client';

import { LayoutDashboard, FileQuestion, TrendingUp, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const scrollToSection = (id: string) => {
    if (isHome) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#080e1a]/95 backdrop-blur-lg px-6 py-3 flex justify-around items-center border-t border-gray-200 dark:border-[#424855]/10 z-50">
      <Link href="/" className={`flex flex-col items-center gap-1 ${isHome ? 'text-[#6cb2ff]' : 'text-gray-500 dark:text-[#a5abbb]'}`}>
        <LayoutDashboard className="w-6 h-6" />
        <span className="text-[10px] font-medium uppercase tracking-widest">Home</span>
      </Link>
      
      {isHome ? (
        <button 
          onClick={() => scrollToSection('quizzes')}
          className="flex flex-col items-center gap-1 text-gray-500 dark:text-[#a5abbb]"
        >
          <FileQuestion className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-widest">Quiz</span>
        </button>
      ) : (
        <Link href="/#quizzes" className="flex flex-col items-center gap-1 text-gray-500 dark:text-[#a5abbb]">
          <FileQuestion className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-widest">Quiz</span>
        </Link>
      )}

      {isHome ? (
        <button 
          onClick={() => scrollToSection('stats')}
          className="flex flex-col items-center gap-1 text-gray-500 dark:text-[#a5abbb]"
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-widest">Stats</span>
        </button>
      ) : (
        <Link href="/#stats" className="flex flex-col items-center gap-1 text-gray-500 dark:text-[#a5abbb]">
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-widest">Stats</span>
        </Link>
      )}

      <Link href="/profile" className={`flex flex-col items-center gap-1 ${pathname === '/profile' ? 'text-[#6cb2ff]' : 'text-gray-500 dark:text-[#a5abbb]'}`}>
        <User className="w-6 h-6" />
        <span className="text-[10px] font-medium uppercase tracking-widest">Profile</span>
      </Link>
    </div>
  );
}
