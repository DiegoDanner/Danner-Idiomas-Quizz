import React, { useState } from 'react';
import { X, User, Flag, RotateCcw, Check, Shield } from 'lucide-react';
import { UserProgress } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onUpdateProfile: (callsign: string, avatarSeed: string, nationality: string, countryCode: string) => void;
  onResetProgress: () => void;
}

const AVATARS = ['✈️', '👩‍✈️', '👨‍✈️', '🧳', '🚀', '🧭', '🦅', '🧑‍💼', '🛂', '🎟️'];
const COUNTRIES = [
  { name: 'United States', code: '🇺🇸' },
  { name: 'United Kingdom', code: '🇬🇧' },
  { name: 'Canada', code: '🇨🇦' },
  { name: 'Australia', code: '🇦🇺' },
  { name: 'Brazil', code: '🇧🇷' },
  { name: 'Japan', code: '🇯🇵' },
  { name: 'Germany', code: '🇩🇪' },
  { name: 'France', code: '🇫🇷' },
  { name: 'Italy', code: '🇮🇹' },
  { name: 'Spain', code: '🇪🇸' },
  { name: 'Albania', code: '🇦🇱' },
  { name: 'International', code: '🌐' }
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  progress,
  onUpdateProfile,
  onResetProgress
}) => {
  const [callsign, setCallsign] = useState(progress.callsign);
  const [selectedAvatar, setSelectedAvatar] = useState(progress.avatarSeed);
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find((c) => c.name === progress.nationality) || COUNTRIES[0]
  );
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateProfile(
      callsign.trim() || 'Aviator_Guest',
      selectedAvatar,
      selectedCountry.name,
      selectedCountry.code
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            <span>Aviator Profile Settings</span>
          </h3>
          <p className="text-xs text-slate-400">
            Customize your pilot callsign, avatar, and country on the competitive leaderboard.
          </p>
        </div>

        {/* Callsign Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Pilot Callsign / Name
          </label>
          <input
            type="text"
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            maxLength={20}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-sky-500 font-mono"
            placeholder="e.g. Captain_Alex"
          />
        </div>

        {/* Avatar Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Choose Your Avatar Emblem
          </label>
          <div className="grid grid-cols-5 gap-2">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                className={`p-2.5 rounded-xl text-2xl border transition-all ${
                  selectedAvatar === av
                    ? 'bg-sky-500/20 border-sky-400 scale-105 shadow'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Country Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Home Country & Flag
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
            {COUNTRIES.map((ct) => (
              <button
                key={ct.name}
                type="button"
                onClick={() => setSelectedCountry(ct)}
                className={`p-2 rounded-xl text-xs font-medium flex items-center gap-2 border text-left transition-all ${
                  selectedCountry.name === ct.name
                    ? 'bg-sky-950 border-sky-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{ct.code}</span>
                <span className="truncate">{ct.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 transition-all"
          >
            Save Profile Changes
          </button>

          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full text-center text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset My App Progress & Score</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-900 text-center space-y-2">
              <div className="text-xs text-red-300 font-bold">
                Reset all XP, mastered words, and badges?
              </div>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                    onClose();
                  }}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
