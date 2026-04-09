'use client';

import { TrendingUp, BarChart3, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserProgress } from '@/lib/progress';
import { useAuth } from '@/context/AuthContext';

export default function ProgressSection() {
  const { user, loading: authLoading } = useAuth();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProgress() {
      if (user) {
        const data = await getUserProgress();
        setProgressData(data || []);
      }
      setLoading(false);
    }

    if (!authLoading) {
      fetchProgress();
    }
  }, [user, authLoading]);

  const totalQuizzes = progressData.length;
  const averageScore = totalQuizzes > 0 
    ? Math.round((progressData.reduce((acc, curr) => acc + (curr.score / curr.total_questions), 0) / totalQuizzes) * 100)
    : 0;
  
  const dailyStreak = totalQuizzes > 0 ? Math.min(30, totalQuizzes) : 0; // Simplified streak logic

  if (loading) {
    return (
      <div className="mt-16 flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#6cb2ff]" />
      </div>
    );
  }

  if (!user) {
    return (
      <section className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1">
          <div className="bg-gray-50 dark:bg-[#121a28] rounded-2xl p-8 border border-gray-200 dark:border-[#424855]/10 opacity-50 grayscale">
             <h4 className="font-headline text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-[#e5ebfc]">
              <TrendingUp className="w-6 h-6 text-[#6cb2ff]" />
              Weekly Progress
            </h4>
            <p className="text-center py-4 text-sm text-gray-500">Sign in to track your progress</p>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="font-headline text-3xl font-extrabold mb-4 text-gray-900 dark:text-[#e5ebfc]">
            Track Your <br />
            <span className="text-[#91f8b8]">Fluent Journey</span>
          </h2>
          <p className="text-gray-600 dark:text-[#a5abbb] mb-6">
            Consistency is the key to mastery. Monitor your performance across different categories and identify areas that need more attention.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
      <div className="order-2 lg:order-1">
        <div className="bg-gray-50 dark:bg-[#121a28] rounded-2xl p-8 border border-gray-200 dark:border-[#424855]/10">
          <h4 className="font-headline text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-[#e5ebfc]">
            <TrendingUp className="w-6 h-6 text-[#6cb2ff]" />
            Your Progress
          </h4>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-[#a5abbb]">Average Accuracy</span>
                <span className="text-[#91f8b8] font-bold">{averageScore}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-[#1d2636] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${averageScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-[#91f8b8] rounded-full" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-[#a5abbb]">Quizzes Completed</span>
                <span className="text-[#6cb2ff] font-bold">{totalQuizzes}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-[#1d2636] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalQuizzes / 20) * 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-[#6cb2ff] rounded-full" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-[#a5abbb]">Learning Momentum</span>
                <span className="text-[#bd9dff] font-bold">{dailyStreak} Days</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-[#1d2636] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(dailyStreak / 30) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-[#bd9dff] rounded-full" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <h2 className="font-headline text-3xl font-extrabold mb-4 text-gray-900 dark:text-[#e5ebfc]">
          Track Your <br />
          <span className="text-[#91f8b8]">Fluent Journey</span>
        </h2>
        <p className="text-gray-600 dark:text-[#a5abbb] mb-6">
          Consistency is the key to mastery. Monitor your performance across different categories and identify areas that need more attention.
        </p>
        <Link href="/profile">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-100 dark:bg-[#1d2636] text-gray-900 dark:text-[#e5ebfc] px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-[#232c3e] transition-colors"
          >
            View Detailed Analytics
            <BarChart3 className="w-5 h-5" />
          </motion.button>
        </Link>
      </div>
    </section>
  );
}
