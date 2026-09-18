import React from 'react';
import { Volume2, VolumeX, Flame, Award, Compass, User, Info } from 'lucide-react';
import { UserProgress } from '../types';
import { calculateLevel } from '../hooks/useUserProgress';

interface HeaderProps {
  progress: UserProgress;
  onToggleSound: () => void;
  onOpenProfile: () => void;
  onOpenCredits: () => void;
  recentXpGain: { amount: number; reason: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onToggleSound,
  onOpenProfile,
  onOpenCredits,
  recentXpGain
}) => {
  const rankInfo = calculateLevel(progress.xp);

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Flight Information Display System (FIDS) Ticker */}
      <div className="bg-amber-400 text-slate-950 py-1 px-4 text-xs font-mono font-bold flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-slate-950 animate-ping" />
          <span>FIDS LIVE:</span>
        </div>
        <div className="truncate px-4">
          <span>FLIGHT BA178 NEW YORK [CAROUSEL 4] • BELLE AIR 2216 [GATE 22 • BOARDING] • FLIGHT NZ245 [DELAYED 2:25] • ENGLISH VOCABULARY BY DIEGO DANNER • HAVE A SAFE TRIP! BON VOYAGE!</span>
        </div>
        <div className="text-[11px] hidden sm:block shrink-0">
          TERMINAL 1
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Flight Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 border border-sky-400/30">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Airport English Master
              </h1>
              <span className="hidden md:inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                Aviation Prep
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Interactive Airport Vocab & Real-World Audio Lab
            </p>
          </div>
        </div>

        {/* User Stats, Streak & Level Indicator */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* XP Gain Floating Notification */}
          {recentXpGain && (
            <div className="animate-bounce text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 shadow-md flex items-center gap-1">
              <span>+{recentXpGain.amount} XP</span>
              <span className="text-[10px] opacity-90 hidden md:inline">({recentXpGain.reason})</span>
            </div>
          )}

          {/* Daily Streak */}
          <div
            id="user-streak-badge"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold"
            title={`${progress.streakDays} Day Practice Streak!`}
          >
            <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{progress.streakDays}d</span>
          </div>

          {/* Level & XP Gauge */}
          <div
            id="user-level-gauge"
            className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
          >
            <div className="text-right">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center justify-end gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>{rankInfo.title}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {progress.xp} <span className="text-slate-500">/ {rankInfo.nextLevelXp} XP</span>
              </div>
            </div>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-500"
                style={{ width: `${rankInfo.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            id="btn-sound-toggle"
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              progress.soundEnabled
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-red-950/40 border-red-900/60 text-red-400 hover:bg-red-900/40'
            }`}
            title={progress.soundEnabled ? 'Sound Enabled (PA Chimes & Audio)' : 'Sound Muted'}
          >
            {progress.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Author Credits Modal Trigger */}
          <button
            id="btn-credits"
            onClick={onOpenCredits}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Curriculum & Vocabulary Credits (Diego Danner)"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* User Profile Button */}
          <button
            id="btn-user-profile"
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
            title="Edit Aviator Profile"
          >
            <div className="w-7 h-7 rounded-md bg-sky-900/60 border border-sky-700/50 flex items-center justify-center text-sm">
              {progress.avatarSeed || <User className="w-4 h-4 text-sky-400" />}
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-bold text-slate-200 truncate max-w-[100px]">
                {progress.callsign}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {progress.countryCode} {progress.nationality}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
