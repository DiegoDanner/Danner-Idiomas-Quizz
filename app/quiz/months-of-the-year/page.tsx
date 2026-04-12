'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Play, RefreshCw, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { useAuthAction } from '@/hooks/useAuthAction';
import { saveQuizProgress } from '@/lib/progress';

const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

// Distance between each month cube on the road
const SPACING = 1200;
// Initial offset so the first cube is visible
const INITIAL_OFFSET = 400;

function Cube({ month, positionY, isCurrent }: { month: string, positionY: number, isCurrent: boolean }) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex items-end justify-center transition-opacity duration-500"
      style={{
        bottom: `${positionY}px`,
        width: '350px',
        height: '200px',
        transformStyle: 'preserve-3d',
        transform: 'rotateX(-90deg)', // Stand up perfectly straight relative to the road
        transformOrigin: 'bottom center',
        opacity: isCurrent ? 1 : 0.6,
      }}
    >
      <div className={`relative w-full h-[160px] flex items-center justify-center transition-all duration-500 ${isCurrent ? 'bg-white/20 shadow-[0_20px_60px_rgba(255,215,0,0.4)]' : 'bg-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'} backdrop-blur-md border-t-8 border-b-8 border-yellow-500`}>
        <span className="text-white font-black text-6xl tracking-widest drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
          {month}
        </span>
      </div>
    </div>
  );
}

export default function MonthsOfTheYearPage() {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();

  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const handleMatch = useCallback(() => {
    if (currentIndexRef.current < MONTHS.length) {
      const nextIndex = currentIndexRef.current + 1;
      setCurrentIndex(nextIndex);
      setTranscript(''); // Clear transcript on match

      if (nextIndex === MONTHS.length) {
        saveQuizProgress({
          quiz_id: 'months-of-the-year',
          score: MONTHS.length,
          total_questions: MONTHS.length
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!started || currentIndexRef.current >= MONTHS.length) return;

    // @ts-expect-error - Web Speech API is not fully typed in TS
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript.trim().toLowerCase();
      setTranscript(text);

      const currentTarget = MONTHS[currentIndexRef.current];
      if (currentTarget && text.includes(currentTarget.toLowerCase())) {
        handleMatch();
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        console.error("Speech recognition error", event.error);
        setError("Microphone permission denied.");
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening && currentIndexRef.current < MONTHS.length) {
        try {
          recognition.start();
        } catch {
          // Ignore errors
        }
      }
    };

    if (isListening) {
      try {
        recognition.start();
      } catch {
        // Ignore errors
      }
    }

    return () => {
      recognition.stop();
    };
  }, [started, isListening, handleMatch]);

  const startGame = () => {
    performAction(async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setStarted(true);
        setIsListening(true);
        setError(null);
      } catch {
        setError("Microphone permission is required to play.");
      }
    });
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setTranscript('');
    setIsListening(true);
  };

  const isFinished = currentIndex >= MONTHS.length;
  const targetMonth = !isFinished ? MONTHS[currentIndex] : "";

  return (
    <div className="min-h-screen bg-[#080e1a] transition-colors duration-300 overflow-hidden">
      <Navbar />

      <main className="relative w-screen h-screen">
        <AnimatePresence mode="wait">
          {!started && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white p-8 text-center"
            >
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 bg-yellow-500/10 rounded-3xl flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-yellow-500" />
                </div>
              </div>
              <h1 className="text-6xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-lg font-headline">
                MONTH MASTER
              </h1>
              <p className="text-xl mb-8 max-w-md text-zinc-300 leading-relaxed">
                Say the name of the month when it appears to advance down the road.
                <br/><br/>
                <span className="text-sm text-zinc-400">Requires microphone permission.</span>
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="flex items-center gap-3 px-10 py-5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full text-2xl transition-all hover:shadow-[0_0_30px_rgba(255,215,0,0.5)]"
              >
                <Play fill="currentColor" size={28} /> Start Playing
              </motion.button>
            </motion.div>
          )}

          {started && (
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0"
            >
              {/* 3D Scene */}
              <div className="absolute inset-0 perspective-container flex items-center justify-center pointer-events-none">
                <div className="camera-tilt">
                  <motion.div
                    className="road-surface"
                    animate={{ y: currentIndex * SPACING }}
                    transition={{ type: 'spring', stiffness: 30, damping: 15, mass: 1.5 }}
                  >
                    <div className="road-dash" />

                    {/* Months */}
                    {MONTHS.map((month, i) => (
                      <Cube
                        key={month}
                        month={month}
                        positionY={i * SPACING + INITIAL_OFFSET}
                        isCurrent={i === currentIndex}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* UI Overlay */}
              {!isFinished && (
                <div className="absolute top-32 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center w-full px-4">
                  <div className="bg-black/60 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 flex items-center gap-6 shadow-2xl min-w-[300px] justify-center">
                    <div className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-zinc-600'}`}>
                      {isListening ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
                    </div>
                    <div className="text-white font-mono text-xl min-w-[200px] text-center truncate">
                      {transcript || <span className="text-zinc-500">Listening...</span>}
                    </div>
                  </div>
                  <div className="mt-6 text-yellow-400 font-black text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-wide font-headline">
                    Say: {targetMonth}
                  </div>
                </div>
              )}

              {isFinished && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white p-8 text-center backdrop-blur-md"
                >
                  <h2 className="text-7xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-lg font-headline">
                    YOU DID IT!
                  </h2>
                  <p className="text-2xl mb-12 text-zinc-300">You&apos;ve mastered all the months.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={restartGame}
                      className="flex items-center gap-3 px-10 py-5 bg-yellow-500 text-black font-bold rounded-full text-2xl hover:bg-yellow-400 transition-all hover:scale-105 active:scale-95"
                    >
                      <RefreshCw size={28} /> Play Again
                    </motion.button>
                    <Link href="/">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 px-10 py-5 bg-white/10 text-white font-bold rounded-full text-2xl hover:bg-white/20 transition-all hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-sm"
                      >
                        <ArrowLeft size={28} /> Back to Menu
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
