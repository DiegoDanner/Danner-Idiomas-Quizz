'use client';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { NavigationTabs, ActiveTab } from './components/NavigationTabs';
import { LessonView } from './components/LessonView';
import { AudioSimulationView } from './components/AudioSimulationView';
import { SpeedChallengeView } from './components/SpeedChallengeView';
import { LuggageScannerView } from './components/LuggageScannerView';
import { VocabularyVault } from './components/VocabularyVault';
import { LeaderboardView } from './components/LeaderboardView';
import { UserProfileModal } from './components/UserProfileModal';
import { DiegoDannerCreditsModal } from './components/DiegoDannerCreditsModal';
import { useUserProgress } from './hooks/useUserProgress';
import { AUDIO_SIMULATION_CHALLENGES } from './data/airportData';

export default function App() {
  const {
    progress,
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
  } = useUserProgress();

  const [activeTab, setActiveTab] = useState<ActiveTab>('lessons');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);

  const pendingSimulations = AUDIO_SIMULATION_CHALLENGES.filter(
    (c) => !progress.completedSimulations.includes(c.id)
  ).length;

  const leaderboard = getLeaderboard();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-sky-500 selection:text-slate-950">
      {/* Flight Control Header */}
      <Header
        progress={progress}
        onToggleSound={toggleSound}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenCredits={() => setIsCreditsModalOpen(true)}
        recentXpGain={recentXpGain}
      />

      {/* Primary Navigation Bar */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingSimulationsCount={pendingSimulations}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'lessons' && (
          <LessonView
            completedLessons={progress.completedLessons}
            masteredWordIds={progress.masteredWordIds}
            onMarkMastered={markWordMastered}
            onCompleteCategory={completeLessonCategory}
            onAddXp={addXp}
            soundEnabled={progress.soundEnabled}
          />
        )}

        {activeTab === 'simulations' && (
          <AudioSimulationView
            completedSimulations={progress.completedSimulations}
            onCompleteSimulation={completeSimulation}
            onAddXp={addXp}
            soundEnabled={progress.soundEnabled}
          />
        )}

        {activeTab === 'speed' && (
          <SpeedChallengeView
            onAddXp={addXp}
            onUnlockBadge={unlockBadge}
            soundEnabled={progress.soundEnabled}
          />
        )}

        {activeTab === 'scanner' && (
          <LuggageScannerView
            onAddXp={addXp}
            onUnlockBadge={unlockBadge}
          />
        )}

        {activeTab === 'vault' && (
          <VocabularyVault
            masteredWordIds={progress.masteredWordIds}
            onMarkMastered={markWordMastered}
            onAddXp={addXp}
            soundEnabled={progress.soundEnabled}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            leaderboard={leaderboard}
            userBadges={progress.badges}
            userXp={progress.xp}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sky-400 font-bold">Airport English Master</span>
            <span>•</span>
            <span>Curriculum by Diego Danner</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <button
              onClick={() => setIsCreditsModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Vocabulary Curriculum
            </button>
            <span>•</span>
            <span>Safe Travels & Bon Voyage!</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        progress={progress}
        onUpdateProfile={updateProfile}
        onResetProgress={resetProgress}
      />

      <DiegoDannerCreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
      />
    </div>
  );
}
