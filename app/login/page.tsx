'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Mail, Loader2, Github, Chrome } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for the login link!' });
      setEmail(''); // Clear the email field on success
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setMessage({ type: 'error', text: error.message });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#080e1a] transition-colors duration-300">
      <Navbar />
      <main className="pt-32 pb-20 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-gray-50 dark:bg-[#121a28] p-8 rounded-[2.5rem] border border-gray-200 dark:border-[#424855]/10 shadow-xl"
        >
          <div className="text-center mb-8">
            <h1 className="font-headline text-3xl font-extrabold text-gray-900 dark:text-[#e5ebfc] mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-500 dark:text-[#a5abbb]">
              Sign in to track your progress and save your scores.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-[#e5ebfc] mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#1d2636] border border-gray-200 dark:border-[#424855]/20 rounded-2xl focus:ring-2 focus:ring-[#6cb2ff] focus:border-transparent transition-all outline-none text-gray-900 dark:text-[#e5ebfc]"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[#6cb2ff] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#6cb2ff]/20 hover:bg-[#5a9ee6] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Magic Link'}
            </motion.button>
          </form>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-[#424855]/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 dark:bg-[#121a28] text-gray-400 font-bold">OR</span>
            </div>
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-[#1d2636] border border-gray-200 dark:border-[#424855]/20 rounded-2xl font-bold text-gray-700 dark:text-[#e5ebfc] hover:bg-gray-50 dark:hover:bg-[#252f41] transition-all shadow-sm"
            >
              <Chrome className="w-5 h-5 text-[#4285F4]" />
              Continue with Google
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin('github')}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-[#1d2636] border border-gray-200 dark:border-[#424855]/20 rounded-2xl font-bold text-gray-700 dark:text-[#e5ebfc] hover:bg-gray-50 dark:hover:bg-[#252f41] transition-all shadow-sm"
            >
              <Github className="w-5 h-5" />
              Continue with GitHub
            </motion.button>
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-6 p-4 rounded-xl text-sm font-medium ${
                message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}
            >
              {message.text}
            </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
