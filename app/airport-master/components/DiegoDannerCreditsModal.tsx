import React from 'react';
import { X, BookOpen, Heart, Award, Sparkles, CheckCircle2 } from 'lucide-react';

interface DiegoDannerCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiegoDannerCreditsModal: React.FC<DiegoDannerCreditsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curriculum & Vocabulary Credits</span>
          </div>
          <h3 className="text-xl font-black text-white">
            Useful English Vocabulary Words For the Airport
          </h3>
          <p className="text-xs text-sky-400 font-medium">
            Original educational text created by Diego Danner
          </p>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <p>
            This application brings to life the complete educational curriculum authored by <strong>Diego Danner</strong>, entitled <em>&quot;Useful English Vocabulary Words For the Airport&quot;</em>.
          </p>
          <p>
            It covers all 27 airport terms across five journey milestones, including:
          </p>
          <ul className="space-y-1.5 text-slate-300 pl-1">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span><strong>Aviation terms & authentic dialogues:</strong> Airline, Departures, Board, Gate, Boarding pass, Customs declarations, Overweight baggage, and Carousel.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span><strong>Essential grammar rules:</strong> Countable (bags / suitcases) vs. Uncountable (pieces of luggage / baggage).</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span><strong>Cultural travel etiquette:</strong> International greetings like <em>&quot;Bon Voyage!&quot;</em> and <em>&quot;Have a safe trip!&quot;</em></span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span><strong>15 Visual airport scenes:</strong> Curated photography matching the exact images (check-in counters, boarding stairs, business class cabins, luggage carousels, visa stamps, and gate corridors).</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
        >
          Close Credits
        </button>
      </div>
    </div>
  );
};
