'use client';

import { Moon, Sun, LogOut, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 dark:bg-[#080e1a]/80 backdrop-blur-xl border-b border-[#424855]/15 shadow-2xl shadow-black/40 transition-colors duration-300">
      <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto font-headline tracking-tight">
        <div className="flex items-center gap-8">
          <a href="https://danneridiomas.netlify.app/" rel="noopener noreferrer" className="text-2xl font-bold text-[#6cb2ff] flex items-center gap-2">
            <Image
              src="/android-chrome-512x512.png"
              alt="Danner Idiomas Logo"
              width={32}
              height={32}
              className="rounded-md"
            />
            Danner Idiomas
          </a>
          <div className="hidden md:flex items-center gap-6">
            <Link className="text-[#a5abbb] hover:text-[#6cb2ff] transition-colors" href="/">Menu</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="hover:bg-gray-100 dark:hover:bg-[#1d2636] rounded-lg transition-all p-2 flex items-center justify-center"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-[#a5abbb]" />
            ) : (
              <Moon className="w-5 h-5 text-[#a5abbb]" />
            )}
          </motion.button>
          
          {user ? (
            <>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => signOut()}
                className="hover:bg-gray-100 dark:hover:bg-[#1d2636] rounded-lg transition-all p-2 flex items-center justify-center"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-[#a5abbb]" />
              </motion.button>
              <Link href="/profile">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-[#1d2636] flex items-center justify-center overflow-hidden border border-[#424855]/20 hover:border-[#6cb2ff]/50 transition-all">
                  {user.user_metadata.avatar_url ? (
                    <Image 
                      src={user.user_metadata.avatar_url} 
                      alt="User profile" 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-[#a5abbb]" />
                  )}
                </div>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#6cb2ff] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg shadow-[#6cb2ff]/20"
              >
                Login
              </motion.button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
