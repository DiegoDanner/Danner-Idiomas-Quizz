'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Mail, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const getRedirectUrl = () => {
    const baseUrl = `${window.location.origin}/auth/callback`;
    if (returnTo) {
      return `${baseUrl}?returnTo=${encodeURIComponent(returnTo)}`;
    }
    return baseUrl;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getRedirectUrl(),
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
        redirectTo: getRedirectUrl(),
      },
    });
    if (error) setMessage({ type: 'error', text: error.message });
  };

  return (
    <>
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
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin('github')}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white dark:bg-[#1d2636] border border-gray-200 dark:border-[#424855]/20 rounded-2xl font-bold text-gray-700 dark:text-[#e5ebfc] hover:bg-gray-50 dark:hover:bg-[#252f41] transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
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
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#080e1a] transition-colors duration-300">
      <Navbar />
      <main className="pt-32 pb-20 px-6 flex items-center justify-center">
        <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin text-[#6cb2ff]" />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
