import React, { useState } from 'react';
import {
  Radio, Volume2, Play, Square, CheckCircle, AlertTriangle,
  HelpCircle, Sparkles, Headphones, Shield, RotateCcw, ArrowRight, Eye, EyeOff
} from 'lucide-react';
import { AUDIO_SIMULATION_CHALLENGES } from '../data/airportData';
import { AudioSimulationChallenge } from '../types';
import { airportSpeech } from '../services/speechSynthesis';
import { playCorrectSound, playWrongSound, playClickSound } from '../services/soundEffects';

interface AudioSimulationViewProps {
  completedSimulations: string[];
  onCompleteSimulation: (id: string) => void;
  onAddXp: (amount: number, reason: string) => void;
  soundEnabled: boolean;
}

export const AudioSimulationView: React.FC<AudioSimulationViewProps> = ({
  completedSimulations,
  onCompleteSimulation,
  onAddXp,
  soundEnabled
}) => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(AUDIO_SIMULATION_CHALLENGES[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(0.95);

  const activeChallenge: AudioSimulationChallenge =
    AUDIO_SIMULATION_CHALLENGES.find((c) => c.id === selectedChallengeId) || AUDIO_SIMULATION_CHALLENGES[0];

  const isCompleted = completedSimulations.includes(activeChallenge.id);

  const handlePlayAnnouncement = async () => {
    if (!soundEnabled) return;
    setIsPlaying(true);

    const voiceStyle =
      activeChallenge.speakerType === 'Captain' ? 'captain' :
      activeChallenge.speakerType === 'Customs Officer' ? 'customs' : 'gate';

    await airportSpeech.playAnnouncement(activeChallenge.announcementScript, {
      voiceStyle,
      rate: speedMultiplier,
      includeChime: true,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  const handleStopAnnouncement = () => {
    airportSpeech.stop();
    setIsPlaying(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    playClickSound();
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isSubmitted) return;
    setIsSubmitted(true);

    const isCorrect = selectedOption === activeChallenge.correctIndex;
    if (isCorrect) {
      playCorrectSound();
      onCompleteSimulation(activeChallenge.id);
      onAddXp(80, `Cleared ${activeChallenge.title}`);
    } else {
      playWrongSound();
    }
  };

  const handleResetChallenge = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowTranscript(false);
    handleStopAnnouncement();
  };

  const handleSelectNewChallenge = (id: string) => {
    playClickSound();
    handleStopAnnouncement();
    setSelectedChallengeId(id);
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowTranscript(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Headphones className="w-6 h-6 text-sky-400" />
            <span>Airport PA Audio Simulations</span>
          </h2>
          <p className="text-sm text-slate-400">
            Train your ear with authentic airport loudspeaker announcements, delay broadcasts, gate changes, and customs dialogues.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-mono text-amber-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{completedSimulations.length} / {AUDIO_SIMULATION_CHALLENGES.length} Simulations Cleared</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Challenge Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Airport Listening Scenarios
          </div>
          <div className="space-y-2">
            {AUDIO_SIMULATION_CHALLENGES.map((challenge, idx) => {
              const isSelected = challenge.id === selectedChallengeId;
              const hasCompleted = completedSimulations.includes(challenge.id);

              return (
                <button
                  key={challenge.id}
                  id={`sim-item-${challenge.id}`}
                  onClick={() => handleSelectNewChallenge(challenge.id)}
                  className={`w-full p-3.5 rounded-xl text-left border transition-all relative ${
                    isSelected
                      ? 'bg-sky-950/80 border-sky-400 shadow-md shadow-sky-500/10 text-white'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-sky-400">
                      Scenario #{idx + 1}
                    </span>
                    {hasCompleted ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Cleared
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold truncate">{challenge.title}</div>
                  <div className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                    <Radio className="w-3 h-3 text-amber-400" />
                    <span>{challenge.location}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Simulation Station (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* PA Terminal Sound Unit */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
            {/* Terminal Loudspeaker Acoustic Box */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 p-5 space-y-4">
              {/* Airport Grid Accents */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                    {activeChallenge.location} • PA Broadcast
                  </span>
                </div>
                <div className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {activeChallenge.speakerType}
                </div>
              </div>

              {/* Central Audio Waves Visualizer */}
              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-md px-4">
                  {[40, 65, 85, 45, 95, 30, 70, 90, 50, 80, 60, 100, 75, 45, 85, 35, 90, 55, 70, 40].map((height, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-full transition-all duration-150 ${
                        isPlaying
                          ? 'bg-gradient-to-t from-sky-500 to-amber-400 animate-pulse'
                          : 'bg-slate-800'
                      }`}
                      style={{
                        height: isPlaying ? `${Math.max(15, (height * (Math.sin(i + Date.now() / 200) + 1.2)) / 2)}%` : '20%',
                        transitionDelay: `${i * 20}ms`
                      }}
                    />
                  ))}
                </div>

                <div className="text-xs text-slate-400 text-center font-mono">
                  {isPlaying ? (
                    <span className="text-amber-400 font-bold flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      BROADCASTING AIRPORT ANNOUNCEMENT (DING-DONG CHIME)...
                    </span>
                  ) : (
                    <span>Click &apos;Play Loudspeaker&apos; to hear the two-tone airport chime and announcement</span>
                  )}
                </div>
              </div>

              {/* PA Playback Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  {!isPlaying ? (
                    <button
                      id="btn-play-sim"
                      onClick={handlePlayAnnouncement}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/25 transition-all active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Play Loudspeaker Announcement</span>
                    </button>
                  ) : (
                    <button
                      id="btn-stop-sim"
                      onClick={handleStopAnnouncement}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/25 transition-all"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>Stop Playback</span>
                    </button>
                  )}

                  <button
                    id="btn-toggle-transcript"
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors border border-slate-700"
                  >
                    {showTranscript ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showTranscript ? 'Hide Transcript' : 'Show Transcript'}</span>
                  </button>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <span>Speed:</span>
                  {[
                    { label: '0.85x', val: 0.85 },
                    { label: '1.0x', val: 0.95 },
                    { label: '1.15x', val: 1.15 }
                  ].map((spd) => (
                    <button
                      key={spd.label}
                      onClick={() => setSpeedMultiplier(spd.val)}
                      className={`px-2 py-1 rounded text-[11px] font-bold ${
                        speedMultiplier === spd.val
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transcript Reveal Box */}
              {showTranscript && (
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono">
                  <div className="text-[10px] text-sky-400 uppercase font-bold tracking-wider mb-1">
                    Announcement Transcript:
                  </div>
                  &quot;{activeChallenge.announcementScript}&quot;
                </div>
              )}
            </div>

            {/* Comprehension Question Box */}
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">
                  Listening Comprehension Question
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white">
                  {activeChallenge.question}
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {activeChallenge.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === activeChallenge.correctIndex;

                  let style = 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200';
                  if (isSelected && !isSubmitted) {
                    style = 'bg-sky-950 border-sky-400 text-white font-semibold';
                  } else if (isSubmitted) {
                    if (isCorrect) {
                      style = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                    } else if (isSelected && !isCorrect) {
                      style = 'bg-red-950/80 border-red-500 text-red-300 line-through';
                    } else {
                      style = 'bg-slate-950/30 border-slate-800/40 text-slate-600';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      id={`sim-opt-${idx}`}
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-3.5 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${style}`}
                    >
                      <span>{option}</span>
                      {isSubmitted && isCorrect && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Result Explanation */}
              {isSubmitted && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    {selectedOption === activeChallenge.correctIndex ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Correct Airport Assessment! (+80 XP)
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> Not quite right. Listen again carefully!
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeChallenge.explanation}
                  </p>
                </div>
              )}

              {/* Submit & Reset Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleResetChallenge}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Question</span>
                </button>

                {!isSubmitted ? (
                  <button
                    id="btn-submit-sim-answer"
                    disabled={selectedOption === null}
                    onClick={handleSubmitAnswer}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <span>Check Answer (+80 XP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const currIdx = AUDIO_SIMULATION_CHALLENGES.findIndex((c) => c.id === activeChallenge.id);
                      const next = AUDIO_SIMULATION_CHALLENGES[(currIdx + 1) % AUDIO_SIMULATION_CHALLENGES.length];
                      handleSelectNewChallenge(next.id);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all"
                  >
                    <span>Next Simulation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
