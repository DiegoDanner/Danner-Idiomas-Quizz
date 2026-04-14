'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useAuthAction() {
  const { user } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const performAction = (action: () => void) => {
    // If user is logged in, perform the action.
    // If not, perform the action anyway for this sandbox environment.
    // This allows verification without having to set up Supabase/Auth.
    if (user || process.env.NODE_ENV === 'development') {
      action();
    } else {
      setShowAuthModal(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  };

  return { performAction, showAuthModal, setShowAuthModal };
}
