'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleAuth = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth error:', error.message);
      }
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        router.push(returnTo);
      } else {
        router.push('/');
      }
    };

    handleAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#080e1a]">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#6cb2ff] mx-auto mb-4" />
        <p className="text-gray-500 dark:text-[#a5abbb] font-medium">Completing login...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#080e1a]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#6cb2ff] mx-auto mb-4" />
          <p className="text-gray-500 dark:text-[#a5abbb] font-medium">Completing login...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
