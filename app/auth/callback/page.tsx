'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth error:', error.message);
      }
      router.push('/');
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#080e1a]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#6cb2ff] mx-auto mb-4" />
        <p className="text-gray-500 dark:text-[#a5abbb] font-medium">Completing login...</p>
      </div>
    </div>
  );
}
