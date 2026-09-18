import React from 'react';
import { BookOpen, Radio, Zap, ScanLine, Layers, Trophy } from 'lucide-react';

export type ActiveTab = 'lessons' | 'simulations' | 'speed' | 'scanner' | 'vault' | 'leaderboard';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  pendingSimulationsCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onChangeTab,
  pendingSimulationsCount
}) => {
  const tabs = [
    {
      id: 'lessons' as ActiveTab,
      label: 'Interactive Lessons',
      shortLabel: 'Lessons',
      icon: BookOpen,
      badge: null
    },
    {
      id: 'simulations' as ActiveTab,
      label: 'Audio Simulations',
      shortLabel: 'Audio PA',
      icon: Radio,
      badge: pendingSimulationsCount > 0 ? `${pendingSimulationsCount} New` : null
    },
    {
      id: 'speed' as ActiveTab,
      label: 'Speed Challenge',
      shortLabel: 'Speed Run',
      icon: Zap,
      badge: 'XP Boost'
    },
    {
      id: 'scanner' as ActiveTab,
      label: 'Luggage Scanner',
      shortLabel: 'Security Lab',
      icon: ScanLine,
      badge: null
    },
    {
      id: 'vault' as ActiveTab,
      label: 'Vocabulary Vault',
      shortLabel: 'Glossary',
      icon: Layers,
      badge: '27 Words'
    },
    {
      id: 'leaderboard' as ActiveTab,
      label: 'Leaderboard',
      shortLabel: 'Ranks',
      icon: Trophy,
      badge: null
    }
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-[77px] z-30 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start sm:justify-center gap-1 sm:gap-2 py-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.shortLabel}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                    isActive
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
