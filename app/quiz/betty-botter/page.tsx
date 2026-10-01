'use client';

import { useAuthAction } from '@/hooks/useAuthAction';
import AuthModal from '@/components/AuthModal';

export default function BettyBotterLabPage() {
  const { showAuthModal, setShowAuthModal } = useAuthAction();

  return (
    <>
      <div className="w-full h-screen">
        <iframe
          src="/betty-botter.html"
          className="w-full h-full border-none"
          title="Betty Botter Lab"
          allow="microphone; camera; display-capture; autoplay"
        />
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
