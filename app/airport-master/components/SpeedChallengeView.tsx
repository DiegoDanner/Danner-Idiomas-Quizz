import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Zap, Heart, Flame, Timer, Play, RotateCcw, Trophy, Check, X, ShieldAlert } from 'lucide-react';
import { VOCABULARY_LIST } from '../data/airportData';
import { playCorrectSound, playWrongSound, playClickSound } from '../services/soundEffects';
import confetti from 'canvas-confetti';

interface SpeedChallengeViewProps {
  onAddXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
  soundEnabled: boolean;
}

interface SpeedQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  grammarNote?: string;
}

export const SpeedChallengeView: React.FC<SpeedChallengeViewProps> = ({
  onAddXp,
  onUnlockBadge,
  soundEnabled
}) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(3);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate dynamic pool of rapid quiz questions based on Diego Danner's text
  const questionPool: SpeedQuestion[] = useMemo(() => {
    const baseQuestions: SpeedQuestion[] = [
      {
        prompt: 'Which of the following is GRAMMATICALLY CORRECT in airport English?',
        options: [
          'I have three luggages to check in',
          'I have three pieces of luggage to check in',
          'I have three baggages to check in',
          'I am booking two one-ways tickets'
        ],
        correctIndex: 1,
        grammarNote: 'Luggage and baggage are uncountable nouns! Always say "pieces of luggage".'
      },
      {
        prompt: 'If you are emigrating to a new country and never coming back, what type of ticket do you book?',
        options: ['Return ticket', 'Round-trip ticket', 'One-way ticket', 'Layover ticket'],
        correctIndex: 2
      },
      {
        prompt: 'What is the maximum allowed liquid container size in carry-on hand luggage?',
        options: ['50 milliliters', '100 milliliters', '250 milliliters', '500 milliliters'],
        correctIndex: 1
      },
      {
        prompt: 'At customs, an officer asks: "Do you have anything to declare?" If you have nothing illegal or over limits, you say:',
        options: ['Yes, my bags are fragile', 'No, nothing to declare', 'I need a boarding pass', 'I am flying economy class'],
        correctIndex: 1
      },
      {
        prompt: 'When a flight is "delayed", it means the flight will depart:',
        options: ['Earlier than scheduled', 'Right on time', 'Later than scheduled', 'Never'],
        correctIndex: 2
      },
      {
        prompt: 'Which phrase is widely borrowed to wish someone a good flight in English?',
        options: ['Bon Voyage!', 'Au Revoir!', 'Carpe Diem!', 'Hakuna Matata!'],
        correctIndex: 0
      },
      {
        prompt: 'The circular motorized conveyor belt in arrivals where you collect suitcases is the:',
        options: ['Departures lounge', 'Baggage claim carousel', 'Runway tarmac', 'Customs inspection desk'],
        correctIndex: 1
      },
      {
        prompt: 'A short or overnight stop in Dubai on your way from London to Sydney is called a:',
        options: ['Boarding time', 'Direct carrier', 'Stopover (layover)', 'Customs visa'],
        correctIndex: 2
      },
      {
        prompt: 'What sticker do you attach to delicate porcelain or glassware in your baggage?',
        options: ['OVERWEIGHT', 'FRAGILE', 'LIQUIDS ONLY', 'VISA REQUIRED'],
        correctIndex: 1
      },
      {
        prompt: 'Which passenger cabin offers the most luxury, legroom, and lie-flat beds?',
        options: ['Economy class', 'Business class', 'First class', 'Coach class'],
        correctIndex: 2
      }
    ];

    // Add randomized vocabulary definition questions
    const vocabQuestions: SpeedQuestion[] = VOCABULARY_LIST.slice(0, 10).map((v) => {
      const wrong = VOCABULARY_LIST.filter((o) => o.id !== v.id).slice(0, 3).map((w) => w.term);
      const options = [v.term, ...wrong].sort(() => 0.5 - Math.random());
      return {
        prompt: `Definition: "${v.definition.slice(0, 95)}..."`,
        options,
        correctIndex: options.indexOf(v.term)
      };
    });

    return [...baseQuestions, ...vocabQuestions].sort(() => 0.5 - Math.random());
  }, []);

  const currentQ = questionPool[currentQuestionIndex % questionPool.length];

  // Timer loop
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleStartGame = () => {
    playClickSound();
    setTimeLeft(45);
    setScore(0);
    setCombo(1);
    setLives(3);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setFeedbackState(null);
    setGameState('playing');
  };

  const handleGameOver = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('gameover');

    // XP calculation: score / 10
    const earnedXp = Math.max(50, Math.round(score / 8));
    onAddXp(earnedXp, `Speed Challenge: ${score} pts`);

    if (score >= 500) {
      onUnlockBadge('speed-flyer');
    }

    confetti({ particleCount: 70, spread: 60 });
  };

  const handleAnswer = (index: number) => {
    if (feedbackState !== null || gameState !== 'playing') return;
    setSelectedAnswer(index);

    const isCorrect = index === currentQ.correctIndex;

    if (isCorrect) {
      playCorrectSound();
      setFeedbackState('correct');
      const pointGain = Math.round(100 * combo);
      setScore((prev) => prev + pointGain);
      setCombo((prev) => Math.min(4, +(prev + 0.5).toFixed(1)));

      setTimeout(() => {
        setFeedbackState(null);
        setSelectedAnswer(null);
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 500);
    } else {
      playWrongSound();
      setFeedbackState('wrong');
      setCombo(1);
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(handleGameOver, 600);
        }
        return newLives;
      });

      setTimeout(() => {
        setFeedbackState(null);
        setSelectedAnswer(null);
        if (lives > 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        }
      }, 750);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Rapid Airport Clearance</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Speed Flight Challenge
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Test your quick-thinking airport vocabulary and grammar against the clock! Keep your combo streak high for maximum XP!
        </p>
      </div>

      {/* IDLE SCREEN */}
      {gameState === 'idle' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
            <Zap className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Ready for Rapid Takeoff?</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              You will have 45 seconds to answer as many airport vocabulary and grammar questions as possible. Beware of uncountable nouns!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <Timer className="w-4 h-4 text-sky-400" /> 45 Seconds
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <Heart className="w-4 h-4 text-red-400 fill-red-400" /> 3 Heart Lives
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" /> Up to x4 Combo
            </div>
          </div>

          <button
            id="btn-start-speed-challenge"
            onClick={handleStartGame}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition-all transform active:scale-95"
          >
            Start Speed Challenge Now
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'playing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Game Status Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            {/* Lives */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-5 h-5 transition-all ${
                    heart <= lives ? 'text-red-500 fill-red-500 scale-110' : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-base font-bold text-sky-400">
              <Timer className="w-4 h-4 text-sky-400 animate-spin" />
              <span>{timeLeft}s</span>
            </div>

            {/* Score & Combo */}
            <div className="text-right">
              <div className="text-sm font-black text-amber-400 font-mono">
                {score} PTS
              </div>
              <div className="text-[11px] font-bold text-emerald-400">
                {combo > 1 ? `x${combo} COMBO 🔥` : 'x1.0'}
              </div>
            </div>
          </div>

          {/* Question Display */}
          <div className="space-y-4 py-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Question #{currentQuestionIndex + 1}
            </div>
            <div className="text-lg sm:text-xl font-bold text-white leading-snug">
              {currentQ.prompt}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentQ.correctIndex;
                let btnStyle = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200';

                if (feedbackState) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-red-950 border-red-500 text-red-300';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-700';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={feedbackState !== null}
                    onClick={() => handleAnswer(idx)}
                    className={`p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {feedbackState && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                    {feedbackState && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'gameover' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
              Flight Challenge Completed
            </div>
            <h3 className="text-3xl font-black text-white">{score} Points</h3>
            <p className="text-sm text-slate-400">
              +{Math.max(50, Math.round(score / 8))} XP earned for your Aviator profile!
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleStartGame}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Fly Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
