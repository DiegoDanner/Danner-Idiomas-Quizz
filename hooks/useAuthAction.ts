'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useAuthAction() {
  const { user } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const performAction = (action: () => void, skipCheck: boolean = false) => {
    if (user || skipCheck) {
      action();
    } else {
      setShowAuthModal(true);
      // Wait a bit then redirect to login, or just show the modal
      // For a better UX, let's just redirect to login so they can sign in
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  };

  return { performAction, showAuthModal, setShowAuthModal };
}
