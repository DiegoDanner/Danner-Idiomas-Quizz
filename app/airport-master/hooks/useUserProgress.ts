import { useState, useEffect, useCallback } from 'react';
import { UserProgress, Badge, LeaderboardCompetitor } from '../types';
import { BADGES_CATALOG, INITIAL_LEADERBOARD, VOCABULARY_LIST } from '../data/airportData';
import confetti from 'canvas-confetti';
import { playCorrectSound } from '../services/soundEffects';

const STORAGE_KEY = 'airport_english_user_progress_v1';

const DEFAULT_PROGRESS: UserProgress = {
  callsign: 'Aviator_Guest',
  avatarSeed: '✈️',
  nationality: 'International',
  countryCode: '🌐',
  xp: 150,
  level: 1,
  streakDays: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  masteredWordIds: ['travel-agent', 'book-ticket'],
  completedLessons: ['Planning & Booking'],
  completedSimulations: [],
  speedHighScore: 0,
  badges: [
    {
      id: 'first-flight',
      title: 'First Flight',
      description: 'Completed your first airport lesson',
      icon: 'Plane',
      unlockedAt: new Date().toISOString()
    }
  ],
  soundEnabled: true
};

export function calculateLevel(xp: number): { level: number; title: string; nextLevelXp: number; progressPercent: number } {
  if (xp < 300) {
    return { level: 1, title: 'Novice Passenger', nextLevelXp: 300, progressPercent: Math.min(100, Math.round((xp / 300) * 100)) };
  } else if (xp < 700) {
    return { level: 2, title: 'Frequent Flyer', nextLevelXp: 700, progressPercent: Math.min(100, Math.round(((xp - 300) / 400) * 100)) };
  } else if (xp < 1300) {
    return { level: 3, title: 'Flight Attendant', nextLevelXp: 1300, progressPercent: Math.min(100, Math.round(((xp - 700) / 600) * 100)) };
  } else if (xp < 2200) {
    return { level: 4, title: 'First Officer', nextLevelXp: 2200, progressPercent: Math.min(100, Math.round(((xp - 1300) / 900) * 100)) };
  } else {
    return { level: 5, title: 'Senior Captain', nextLevelXp: 3500, progressPercent: Math.min(100, Math.round(((xp - 2200) / 1300) * 100)) };
  }
}

export function useUserProgress() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROGRESS;
  });

  const [recentXpGain, setRecentXpGain] = useState<{ amount: number; reason: string } | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // storage quota or private browsing
    }
  }, [progress]);

  const addXp = useCallback((amount: number, reason: string) => {
    setProgress((prev) => {
      const newXp = prev.xp + amount;
      const oldLevel = calculateLevel(prev.xp).level;
      const newLevel = calculateLevel(newXp).level;

      if (newLevel > oldLevel) {
        // Level up celebration!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setRecentXpGain({ amount, reason });
      setTimeout(() => setRecentXpGain(null), 3000);

      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
  }, []);

  const markWordMastered = useCallback((wordId: string) => {
    setProgress((prev) => {
      if (prev.masteredWordIds.includes(wordId)) return prev;
      playCorrectSound();
      return {
        ...prev,
        masteredWordIds: [...prev.masteredWordIds, wordId]
      };
    });
  }, []);

  const completeLessonCategory = useCallback((category: string) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(category)) return prev;
      confetti({ particleCount: 50, spread: 60 });
      return {
        ...prev,
        completedLessons: [...prev.completedLessons, category]
      };
    });
    addXp(120, `Completed ${category} Lesson`);
  }, [addXp]);

  const completeSimulation = useCallback((simId: string) => {
    setProgress((prev) => {
      if (prev.completedSimulations.includes(simId)) return prev;
      return {
        ...prev,
        completedSimulations: [...prev.completedSimulations, simId]
      };
    });
    addXp(80, 'Audio Challenge Cleared');
  }, [addXp]);

  const unlockBadge = useCallback((badgeId: string) => {
    const badgeDef = BADGES_CATALOG.find((b) => b.id === badgeId);
    if (!badgeDef) return;

    setProgress((prev) => {
      if (prev.badges.some((b) => b.id === badgeId)) return prev;
      confetti({ particleCount: 90, spread: 80 });
      const newBadge: Badge = {
        ...badgeDef,
        unlockedAt: new Date().toISOString()
      };
      return {
        ...prev,
        badges: [...prev.badges, newBadge]
      };
    });
  }, []);

  const updateProfile = useCallback((callsign: string, avatarSeed: string, nationality: string, countryCode: string) => {
    setProgress((prev) => ({
      ...prev,
      callsign,
      avatarSeed,
      nationality,
      countryCode
    }));
  }, []);

  const toggleSound = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Compute competitive leaderboard rankings with user merged in
  const getLeaderboard = useCallback((): LeaderboardCompetitor[] => {
    const userTier: LeaderboardCompetitor['tier'] =
      progress.xp >= 2200 ? 'Diamond Captain' :
      progress.xp >= 1300 ? 'Gold Aviator' :
      progress.xp >= 700 ? 'Silver Sky' : 'Bronze Passenger';

    const userEntry: LeaderboardCompetitor = {
      id: 'current-user',
      rank: 0,
      callsign: progress.callsign,
      country: progress.nationality,
      flag: progress.countryCode,
      avatar: progress.avatarSeed,
      tier: userTier,
      xp: progress.xp,
      badgesCount: progress.badges.length,
      isCurrentUser: true
    };

    const combined = [...INITIAL_LEADERBOARD, userEntry].sort((a, b) => b.xp - a.xp);
    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }, [progress]);

  const totalWordsCount = VOCABULARY_LIST.length;
  const masteredWordsCount = progress.masteredWordIds.length;
  const userRankInfo = calculateLevel(progress.xp);

  return {
    progress,
    userRankInfo,
    totalWordsCount,
    masteredWordsCount,
    recentXpGain,
    addXp,
    markWordMastered,
    completeLessonCategory,
    completeSimulation,
    unlockBadge,
    updateProfile,
    toggleSound,
    resetProgress,
    getLeaderboard
  };
}
