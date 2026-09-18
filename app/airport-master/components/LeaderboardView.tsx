import React, { useState } from 'react';
import { Trophy, Medal, Award, Flame, User, Sparkles, Shield, Compass } from 'lucide-react';
import { LeaderboardCompetitor, Badge } from '../types';
import { BADGES_CATALOG } from '../data/airportData';

interface LeaderboardViewProps {
  leaderboard: LeaderboardCompetitor[];
  userBadges: Badge[];
  userXp: number;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboard,
  userBadges,
  userXp
}) => {
  const [activeFilter, setActiveFilter] = useState<'all-time' | 'weekly'>('all-time');

  const topThree = leaderboard.slice(0, 3);
  const restList = leaderboard.slice(3);

  const currentUser = leaderboard.find((c) => c.isCurrentUser);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Competitive Aviators Leaderboard</span>
          </h2>
          <p className="text-sm text-slate-400">
            Compete with travelers worldwide by mastering airport terminology, clearing listening simulations, and acing speed tests.
          </p>
        </div>

        {/* Filter Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveFilter('all-time')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeFilter === 'all-time' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Global All-Time
          </button>
          <button
            onClick={() => setActiveFilter('weekly')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeFilter === 'weekly' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Flight Cup
          </button>
        </div>
      </div>

      {/* Podium (Top 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-end max-w-4xl mx-auto">
        {/* Rank 2 (Silver) */}
        {topThree[1] && (
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 text-center space-y-3 relative order-2 md:order-1 shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black flex items-center justify-center text-sm shadow-md border-2 border-slate-900">
              2
            </div>
            <div className="text-3xl pt-2">{topThree[1].avatar}</div>
            <div>
              <div className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                <span>{topThree[1].flag}</span>
                <span>{topThree[1].callsign}</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">{topThree[1].country}</div>
            </div>
            <div className="text-sm font-black text-slate-200 font-mono">
              {topThree[1].xp} XP
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {topThree[1].tier}
            </div>
          </div>
        )}

        {/* Rank 1 (Gold) */}
        {topThree[0] && (
          <div className="bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 text-center space-y-3 relative order-1 md:order-2 shadow-2xl shadow-amber-500/10 scale-105">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base shadow-lg border-2 border-slate-950">
              👑
            </div>
            <div className="text-4xl pt-2">{topThree[0].avatar}</div>
            <div>
              <div className="text-lg font-black text-amber-300 flex items-center justify-center gap-1.5">
                <span>{topThree[0].flag}</span>
                <span>{topThree[0].callsign}</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">{topThree[0].country}</div>
            </div>
            <div className="text-base font-black text-amber-400 font-mono">
              {topThree[0].xp} XP
            </div>
            <div className="text-[11px] uppercase font-black text-amber-400 bg-amber-400/10 py-0.5 rounded-full border border-amber-400/20">
              {topThree[0].tier}
            </div>
          </div>
        )}

        {/* Rank 3 (Bronze) */}
        {topThree[2] && (
          <div className="bg-slate-900/90 border border-amber-800/50 rounded-3xl p-5 text-center space-y-3 relative order-3 shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-600 text-slate-950 font-black flex items-center justify-center text-sm shadow-md border-2 border-slate-900">
              3
            </div>
            <div className="text-3xl pt-2">{topThree[2].avatar}</div>
            <div>
              <div className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                <span>{topThree[2].flag}</span>
                <span>{topThree[2].callsign}</span>
              </div>
              <div className="text-xs text-slate-400 font-mono">{topThree[2].country}</div>
            </div>
            <div className="text-sm font-black text-amber-500 font-mono">
              {topThree[2].xp} XP
            </div>
            <div className="text-[10px] uppercase font-bold text-amber-600">
              {topThree[2].tier}
            </div>
          </div>
        )}
      </div>

      {/* User Current Standing Card */}
      {currentUser && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-sky-950/80 to-blue-950/80 border border-sky-500/50 flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-sky-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 font-black flex items-center justify-center text-base">
              #{currentUser.rank}
            </div>
            <div>
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Your Current Standing
              </div>
              <div className="text-base font-black text-white flex items-center gap-1.5">
                <span>{currentUser.avatar}</span>
                <span>{currentUser.callsign}</span>
                <span className="text-xs text-slate-400 font-normal">({currentUser.country})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-400">Total Score</div>
              <div className="text-base font-black text-amber-400 font-mono">{userXp} XP</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Aviator Tier</div>
              <div className="text-xs font-bold text-sky-300 font-mono">{currentUser.tier}</div>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Rank & Competitor</span>
          <span>Tier & Score</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {leaderboard.map((item) => {
            const isUser = item.isCurrentUser;
            return (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                  isUser ? 'bg-sky-950/40 border-l-4 border-sky-400' : 'hover:bg-slate-850/50'
                }`}
              >
                <div className="flex items-center gap-3.5 truncate">
                  <span className="w-7 font-mono font-bold text-sm text-slate-400 shrink-0">
                    #{item.rank}
                  </span>
                  <span className="text-2xl">{item.avatar}</span>
                  <div className="truncate">
                    <div className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                      <span>{item.callsign}</span>
                      {isUser && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500 text-slate-950 font-bold uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <span>{item.flag}</span>
                      <span>{item.country}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-amber-400 font-mono">
                    {item.xp} XP
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.tier}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges & Achievements Section */}
      <div className="max-w-4xl mx-auto space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-400" />
            <span>Flight Badges & Achievements</span>
          </h3>
          <div className="text-xs text-slate-400 font-mono">
            {userBadges.length} / {BADGES_CATALOG.length} Unlocked
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {BADGES_CATALOG.map((badge) => {
            const isUnlocked = userBadges.some((b) => b.id === badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-2xl border text-center space-y-2 transition-all ${
                  isUnlocked
                    ? 'bg-slate-900 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-40'
                }`}
              >
                <div className="text-3xl mx-auto">
                  {isUnlocked ? '🎖️' : '🔒'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white truncate">{badge.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{badge.description}</div>
                </div>
                {isUnlocked && (
                  <span className="inline-block text-[9px] font-bold text-amber-400 font-mono uppercase bg-amber-400/10 px-2 py-0.5 rounded">
                    Unlocked
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
