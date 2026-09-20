import React, { useState, useMemo } from 'react';
import { Search, Volume2, Radio, CheckCircle2, Filter, Sparkles, BookOpen } from 'lucide-react';
import { VOCABULARY_LIST } from '../data/airportData';
import { WordCategory, VocabularyItem } from '../types';
import { HoverText } from './HoverTranslator';
import { ptTranslations } from '../data/translations';
import { airportSpeech } from '../services/speechSynthesis';
import { playClickSound } from '../services/soundEffects';

interface VocabularyVaultProps {
  masteredWordIds: string[];
  onMarkMastered: (id: string) => void;
  onAddXp: (amount: number, reason: string) => void;
  soundEnabled: boolean;
}

export const VocabularyVault: React.FC<VocabularyVaultProps> = ({
  masteredWordIds,
  onMarkMastered,
  onAddXp,
  soundEnabled
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WordCategory | 'All'>('All');

  const filteredWords = useMemo(() => {
    return VOCABULARY_LIST.filter((w) => {
      const matchCat = selectedCategory === 'All' || w.category === selectedCategory;
      const matchQuery =
        searchQuery.trim() === '' ||
        w.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.definition.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

  const handlePronounce = (term: string) => {
    if (!soundEnabled) return;
    airportSpeech.speakTerm(term);
  };

  const handleAnnouncement = (text: string) => {
    if (!soundEnabled) return;
    airportSpeech.playAnnouncement(text);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-400" />
            <span>Airport Vocabulary Vault</span>
          </h2>
          <p className="text-sm text-slate-400">
            Complete airport glossary created by Diego Danner with real-world definitions, pronunciation, and sample dialogues.
          </p>
        </div>

        <div className="text-xs font-mono text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
          {masteredWordIds.length} / {VOCABULARY_LIST.length} Words Mastered
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="vault-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search airport terms, definitions, or phrases..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['All', 'Planning & Booking', 'Airport Check-In', 'Security & Gates', 'In-Flight & Classes', 'Arrivals & Customs'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playClickSound();
                setSelectedCategory(cat as WordCategory | 'All');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-slate-950 font-bold border-sky-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWords.map((word) => {
          const isMastered = masteredWordIds.includes(word.id);

          return (
            <div
              key={word.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-md group"
            >
              <div className="space-y-3">
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 font-mono">
                      {word.category}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                      {word.term}
                    </h3>
                    {word.pronunciationIpa && (
                      <span className="text-[11px] font-mono text-slate-400">
                        {word.pronunciationIpa}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                      {word.partOfSpeech}
                    </span>
                  </div>
                </div>

                {/* Definition */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <HoverText text={word.definition} translation={ptTranslations[word.definition] || "Tradução não disponível."} />
                </p>

                {/* Example sentence */}
                {word.exampleSentences[0] && (
                  <div className="text-[11px] text-slate-400 italic">
                    <HoverText text={`"${word.exampleSentences[0]}"`} translation={ptTranslations[word.exampleSentences[0]] || "Tradução não disponível."} />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePronounce(word.term)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                    title="Pronounce Word"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleAnnouncement(word.audioAnnouncementText)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                    title="Simulate Airport Announcement"
                  >
                    <Radio className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    onMarkMastered(word.id);
                    onAddXp(30, `Mastered "${word.term}"`);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isMastered
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isMastered ? 'Mastered' : 'Mark Learned'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
