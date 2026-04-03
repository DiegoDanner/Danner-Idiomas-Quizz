'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { getUserProgress } from '@/lib/progress';
import Navbar from '@/components/Navbar';
import { Trophy, Calendar, CheckCircle, ArrowRight, User as UserIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface ProgressRecord {
  id: string;
  quiz_id: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

const QUIZ_NAMES: Record<string, string> = {
  'memory-match': 'Vocabulary Memory Match',
  'object-pronouns': 'Object Pronouns Quiz',
  'third-person': 'Third Person Quiz',
  'practice-questions': 'Questions to Practice',
};


export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      getUserProgress().then(data => {
        setProgress(data as ProgressRecord[]);
        setFetching(false);
      });
    }
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#080e1a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#6cb2ff]" />
      </div>
    );
  }

  if (!user) return null;

  const totalQuizzes = progress.length;
  const totalCorrect = progress.reduce((acc, curr) => acc + curr.score, 0);
  const totalQuestions = progress.reduce((acc, curr) => acc + curr.total_questions, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <>
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar: User Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-gray-50 dark:bg-[#121a28] p-8 rounded-[2.5rem] border border-gray-200 dark:border-[#424855]/10 shadow-xl text-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-[#1d2636] rounded-full mx-auto mb-4 overflow-hidden border-4 border-white dark:border-[#121a28] shadow-lg relative">
                {user.user_metadata.avatar_url ? (
                  <Image 
                    src={user.user_metadata.avatar_url} 
                    alt="Avatar" 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-gray-400" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc]">
                {user.user_metadata.full_name || user.email?.split('@')[0]}
              </h2>
              <p className="text-gray-500 dark:text-[#a5abbb] text-sm mb-6">{user.email}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-[#424855]/10">
                <div className="text-center">
                  <div className="text-2xl font-black text-[#6cb2ff]">{totalQuizzes}</div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-green-500">{averageScore}%</div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Avg Score</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content: Progress History */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc]">
                Learning Progress
              </h3>
              <div className="flex items-center gap-2 text-sm font-bold text-[#6cb2ff]">
                <Calendar className="w-4 h-4" />
                Recent Activity
              </div>
            </div>

            {progress.length === 0 ? (
              <div className="bg-gray-50 dark:bg-[#121a28] p-12 rounded-[2.5rem] border border-dashed border-gray-300 dark:border-[#424855]/30 text-center">
                <Trophy className="w-12 h-12 text-gray-300 dark:text-[#424855] mx-auto mb-4" />
                <p className="text-gray-500 dark:text-[#a5abbb] font-medium">No progress recorded yet. Start a quiz to see your results here!</p>
                <Link href="/">
                  <button className="mt-6 bg-[#6cb2ff] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#5a9ee6] transition-all">
                    Browse Quizzes
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {progress.map((record) => (
                  <motion.div 
                    key={record.id}
                    whileHover={{ x: 4 }}
                    className="bg-gray-50 dark:bg-[#121a28] p-6 rounded-3xl border border-gray-200 dark:border-[#424855]/10 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-[#1d2636] rounded-2xl flex items-center justify-center border border-gray-100 dark:border-[#424855]/20">
                        <CheckCircle className={`w-6 h-6 ${record.score === record.total_questions ? 'text-green-500' : 'text-[#6cb2ff]'}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-[#e5ebfc]">
                          {QUIZ_NAMES[record.quiz_id] || record.quiz_id}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-[#a5abbb]">
                          {new Date(record.completed_at).toLocaleDateString()} at {new Date(record.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-gray-900 dark:text-[#e5ebfc]">
                        {record.score} <span className="text-sm text-gray-400 font-bold">/ {record.total_questions}</span>
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        {Math.round((record.score / record.total_questions) * 100)}% Accuracy
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
