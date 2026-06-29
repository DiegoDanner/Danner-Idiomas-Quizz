'use client';

import { ArrowRight, LucideIcon } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthAction } from '@/hooks/useAuthAction';
import AuthModal from './AuthModal';

interface QuizCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  actionText: string;
  actionColor: string;
  isHighlight?: boolean;
  href?: string;
  skipAuth?: boolean;
}

export default function QuizCard({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBg,
  actionText,
  actionColor,
  isHighlight = false,
  href,
  skipAuth = false,
}: QuizCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const router = useRouter();
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleClick = () => {
    if (href) {
      performAction(() => {
        if (href.startsWith('http')) {
          window.location.href = href;
        } else {
          router.push(href);
        }
      }, skipAuth);
    }
  };

  return (
    <>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ y: -4 }}
        className={isHighlight 
          ? "group relative overflow-hidden bg-[#5ba4f3] rounded-xl p-8 transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[280px] shadow-lg hover:shadow-[#5ba4f3]/40"
          : "group relative bg-gray-50 dark:bg-[#121a28] rounded-xl p-8 hover:bg-white dark:hover:bg-[#1d2636] transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[280px] border border-gray-200 dark:border-[#424855]/10 shadow-sm hover:shadow-xl dark:hover:shadow-[#6cb2ff]/10"
        }
      >
        {!isHighlight && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl bg-gradient-to-br from-transparent via-[#6cb2ff]/5 to-transparent pointer-events-none" />
        )}
        
        {isHighlight && (
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Icon className="w-24 h-24 text-white" />
          </div>
        )}

        <div className="relative z-10" style={{ transform: `translateZ(${isHighlight ? 50 : 40}px)` }}>
          <div className={`w-14 h-14 ${isHighlight ? 'bg-white/20' : iconBg} rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
            <Icon className={`w-8 h-8 ${isHighlight ? 'text-[#002442]' : iconColor}`} />
          </div>
          <h3 className={`font-headline text-2xl font-bold mb-3 ${isHighlight ? 'text-[#002442]' : 'text-gray-900 dark:text-[#e5ebfc]'}`}>{title}</h3>
          <p className={`text-sm leading-relaxed ${isHighlight ? 'text-[#002442]/80 font-medium' : 'text-gray-600 dark:text-[#a5abbb]'}`}>
            {description}
          </p>
        </div>
        <div className={`relative z-10 flex items-center gap-2 mt-6 ${isHighlight ? 'text-[#002442] font-bold' : `${actionColor} font-semibold`} text-sm`} style={{ transform: `translateZ(${isHighlight ? 30 : 20}px)` }}>
          <span>{actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </motion.div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
