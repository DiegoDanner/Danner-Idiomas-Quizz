import React, { useState } from 'react';
import {
  ScanLine, CheckCircle, AlertOctagon, Scale, Droplets,
  ShieldAlert, AlertTriangle, ArrowRight, RotateCcw, Check, Sparkles
} from 'lucide-react';
import { LUGGAGE_SCANNER_ITEMS } from '../data/airportData';
import { InspectionItem } from '../types';
import { playCorrectSound, playWrongSound, playClickSound } from '../services/soundEffects';

interface LuggageScannerViewProps {
  onAddXp: (amount: number, reason: string) => void;
  onUnlockBadge: (badgeId: string) => void;
}

export const LuggageScannerView: React.FC<LuggageScannerViewProps> = ({
  onAddXp,
  onUnlockBadge
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [clearedItems, setClearedItems] = useState<string[]>([]);

  const currentItem: InspectionItem = LUGGAGE_SCANNER_ITEMS[currentIndex % LUGGAGE_SCANNER_ITEMS.length];

  const handleSelectAction = (action: InspectionItem['correctAction']) => {
    if (submitted) return;
    playClickSound();
    setSelectedAction(action);
    setSubmitted(true);

    const isCorrect = action === currentItem.correctAction;
    if (isCorrect) {
      playCorrectSound();
      setClearedItems((prev) => [...prev, currentItem.id]);
      onAddXp(50, `Inspected ${currentItem.name}`);

      if (clearedItems.length + 1 >= LUGGAGE_SCANNER_ITEMS.length) {
        onUnlockBadge('scanner-ace');
      }
    } else {
      playWrongSound();
    }
  };

  const handleNext = () => {
    setSelectedAction(null);
    setSubmitted(false);
    setCurrentIndex((prev) => (prev + 1) % LUGGAGE_SCANNER_ITEMS.length);
  };

  const handleReset = () => {
    setSelectedAction(null);
    setSubmitted(false);
    setCurrentIndex(0);
    setClearedItems([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-bold uppercase tracking-wider">
          <ScanLine className="w-4 h-4 text-sky-400" />
          <span>Interactive Security & Check-In Checkpoint</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Airport Luggage Scanner Lab
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Act as the airport security & check-in officer! Decide whether to approve luggage, confiscate liquids, tag fragile items, or charge overweight fees.
        </p>
      </div>

      {/* Main Scanner Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Scanner Belt & Screen */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-4">
          {/* Laser Line Effect */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-[0_0_15px_cyan]" />

          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-cyan-300">
                X-RAY CONVEYOR BELT • ITEM {currentIndex + 1} OF {LUGGAGE_SCANNER_ITEMS.length}
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              {clearedItems.length} Solved
            </div>
          </div>

          {/* Item Graphic & Description */}
          <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
            <div className="w-28 h-28 rounded-2xl bg-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner relative shrink-0">
              {currentItem.correctAction === 'confiscate_liquid' && <Droplets className="w-14 h-14" />}
              {currentItem.correctAction === 'charge_overweight' && <Scale className="w-14 h-14" />}
              {currentItem.correctAction === 'tag_fragile' && <AlertTriangle className="w-14 h-14" />}
              {currentItem.correctAction === 'customs_declaration' && <ShieldAlert className="w-14 h-14" />}
              {currentItem.correctAction === 'allow' && <CheckCircle className="w-14 h-14 text-emerald-400" />}

              <div className="absolute -bottom-2 text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                {currentItem.category}
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl font-bold text-white">{currentItem.name}</h3>
              <p className="text-sm text-slate-300">{currentItem.description}</p>
              <div className="text-xs font-mono text-amber-300 bg-amber-400/10 inline-block px-2.5 py-1 rounded border border-amber-400/20">
                🔍 {currentItem.details}
              </div>
            </div>
          </div>
        </div>

        {/* Action Decision Buttons */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">
            Select the Correct Airport Protocol Action:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'allow' as const,
                label: 'Approve & Allow Through',
                desc: 'Complies with all airline and security requirements',
                icon: CheckCircle,
                border: 'hover:border-emerald-500'
              },
              {
                id: 'confiscate_liquid' as const,
                label: 'Confiscate: Liquid Exceeds 100ml',
                desc: 'Forbidden in cabin carry-on under international rules',
                icon: Droplets,
                border: 'hover:border-blue-500'
              },
              {
                id: 'charge_overweight' as const,
                label: 'Charge Overweight Baggage Fee',
                desc: 'Suitcase weighs more than allowed ticket allowance (>20kg)',
                icon: Scale,
                border: 'hover:border-amber-500'
              },
              {
                id: 'tag_fragile' as const,
                label: 'Tag with "FRAGILE" Sticker',
                desc: 'Delicate / easily broken item needing special manual handling',
                icon: AlertTriangle,
                border: 'hover:border-yellow-500'
              },
              {
                id: 'customs_declaration' as const,
                label: 'Declare at Customs Border',
                desc: 'Requires inspection by customs officers upon entry',
                icon: ShieldAlert,
                border: 'hover:border-purple-500'
              }
            ].map((act) => {
              const Icon = act.icon;
              const isSelected = selectedAction === act.id;
              const isCorrect = act.id === currentItem.correctAction;

              let style = `bg-slate-950/60 border-slate-800 ${act.border} text-slate-200`;
              if (submitted) {
                if (isCorrect) {
                  style = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold';
                } else if (isSelected && !isCorrect) {
                  style = 'bg-red-950/90 border-red-500 text-red-300';
                } else {
                  style = 'bg-slate-950/30 border-slate-900 text-slate-700';
                }
              }

              return (
                <button
                  key={act.id}
                  id={`scanner-act-${act.id}`}
                  disabled={submitted}
                  onClick={() => handleSelectAction(act.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${style}`}
                >
                  <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold">{act.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{act.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        {submitted && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              {selectedAction === currentItem.correctAction ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Correct Airport Assessment! (+50 XP)
                </span>
              ) : (
                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" /> Security Protocol Breach!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentItem.explanation}
            </p>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scanner</span>
          </button>

          {submitted && (
            <button
              id="btn-scanner-next"
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
            >
              <span>Next Luggage Item</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
