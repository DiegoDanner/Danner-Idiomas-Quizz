import React, { useState, useMemo } from 'react';
import {
  CheckCircle2, Volume2, Radio, ArrowRight, ArrowLeft,
  HelpCircle, Lightbulb, Sparkles, Check, ChevronRight, BookOpen, AlertCircle
} from 'lucide-react';
import { WordCategory, VocabularyItem } from '../types';
import { HoverText } from './HoverTranslator';
import { ptTranslations } from '../data/translations';
import { VOCABULARY_LIST, GRAMMAR_TIPS } from '../data/airportData';
import { airportSpeech } from '../services/speechSynthesis';
import { playCorrectSound, playWrongSound, playClickSound } from '../services/soundEffects';

interface LessonViewProps {
  completedLessons: string[];
  masteredWordIds: string[];
  onMarkMastered: (id: string) => void;
  onCompleteCategory: (category: string) => void;
  onAddXp: (amount: number, reason: string) => void;
  soundEnabled: boolean;
}

const CATEGORIES: { name: WordCategory; label: string; icon: string; desc: string }[] = [
  {
    name: 'Planning & Booking',
    label: '1. Trip Planning & Booking',
    icon: '🎫',
    desc: 'Travel agents, booking tickets, airlines, and visas.'
  },
  {
    name: 'Airport Check-In',
    label: '2. Terminal Check-In',
    icon: '🧳',
    desc: 'Departures hall, check-in desks, passports, and baggage limits.'
  },
  {
    name: 'Security & Gates',
    label: '3. Security Screening & Gates',
    icon: '🛂',
    desc: 'The 100ml liquid rule, fragile labels, boarding passes, and gate calls.'
  },
  {
    name: 'In-Flight & Classes',
    label: '4. In-Flight & Cabin Classes',
    icon: '✈️',
    desc: 'Boarding planes, economy vs business vs first class, and layovers.'
  },
  {
    name: 'Arrivals & Customs',
    label: '5. Arrivals & Border Customs',
    icon: '🛬',
    desc: 'Arrivals hall, luggage carousels, customs declarations, and delays.'
  }
];

export const LessonView: React.FC<LessonViewProps> = ({
  completedLessons,
  masteredWordIds,
  onMarkMastered,
  onCompleteCategory,
  onAddXp,
  soundEnabled
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WordCategory>('Planning & Booking');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'study' | 'dialogue' | 'quiz'>('study');

  // Checkpoint Quiz State
  const [quizAnswerSelected, setQuizAnswerSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizStep, setQuizStep] = useState(0);

  const categoryWords = useMemo(() => {
    return VOCABULARY_LIST.filter((w) => w.category === selectedCategory);
  }, [selectedCategory]);

  const currentWord: VocabularyItem | undefined = categoryWords[currentWordIndex] || categoryWords[0];

  const categoryProgress = useMemo(() => {
    const total = categoryWords.length;
    const mastered = categoryWords.filter((w) => masteredWordIds.includes(w.id)).length;
    const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
    return { total, mastered, percent };
  }, [categoryWords, masteredWordIds]);

  // Stage Checkpoint Questions
  const checkpointQuestions = useMemo(() => {
    return categoryWords.map((word) => {
      // Pick 3 random distractors from other words
      const others = VOCABULARY_LIST.filter((w) => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [word.term, ...others.map((o) => o.term)].sort(() => 0.5 - Math.random());
      const correctIdx = options.indexOf(word.term);

      return {
        prompt: `Which airport term matches this definition?\n"${word.definition}"`,
        options,
        correctIdx,
        term: word.term,
        explanation: word.exampleSentences[0]
      };
    });
  }, [categoryWords]);

  const handlePlayPronunciation = () => {
    if (!soundEnabled || !currentWord) return;
    setIsPlayingAudio(true);
    airportSpeech.speakTerm(currentWord.term, () => setIsPlayingAudio(false));
  };

  const handlePlayAnnouncement = () => {
    if (!soundEnabled || !currentWord) return;
    setIsPlayingAudio(true);
    airportSpeech.playAnnouncement(currentWord.audioAnnouncementText, {
      voiceStyle: currentWord.category === 'In-Flight & Classes' ? 'captain' : 'gate',
      onEnd: () => setIsPlayingAudio(false)
    });
  };

  const handleNextWord = () => {
    playClickSound();
    if (currentWordIndex < categoryWords.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    }
  };

  const handlePrevWord = () => {
    playClickSound();
    if (currentWordIndex > 0) {
      setCurrentWordIndex((prev) => prev - 1);
    }
  };

  const handleCategorySelect = (cat: WordCategory) => {
    playClickSound();
    setSelectedCategory(cat);
    setCurrentWordIndex(0);
    setActiveTab('study');
    setQuizStep(0);
    setQuizSubmitted(false);
    setQuizAnswerSelected(null);
  };

  const handleAnswerQuiz = (optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswerSelected(optionIndex);
    setQuizSubmitted(true);

    const isCorrect = optionIndex === checkpointQuestions[quizStep]?.correctIdx;
    if (isCorrect) {
      playCorrectSound();
      onAddXp(25, 'Correct Quiz Answer');
    } else {
      playWrongSound();
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizStep < checkpointQuestions.length - 1) {
      setQuizStep((prev) => prev + 1);
      setQuizAnswerSelected(null);
      setQuizSubmitted(false);
    } else {
      // Completed Checkpoint!
      onCompleteCategory(selectedCategory);
      setActiveTab('study');
    }
  };

  const isCurrentMastered = currentWord ? masteredWordIds.includes(currentWord.id) : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Category Tabs / Stepper */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-sky-400" />
              <span>Interactive Airport Lessons</span>
            </h2>
            <p className="text-sm text-slate-400">
              Master the exact 27 real-world airport vocabulary terms & grammar rules by Diego Danner.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Progress</span>
            <div className="text-sm font-extrabold text-amber-400 font-mono">
              {masteredWordIds.length} / {VOCABULARY_LIST.length} Terms Mastered
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const isCompleted = completedLessons.includes(cat.name);
            return (
              <button
                key={cat.name}
                id={`cat-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => handleCategorySelect(cat.name)}
                className={`p-3 rounded-xl text-left border transition-all relative ${
                  isSelected
                    ? 'bg-sky-950/80 border-sky-400 shadow-md shadow-sky-500/10 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                {isCompleted && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                )}
                <div className="text-xl mb-1">{cat.icon}</div>
                <div className="text-xs font-bold truncate">{cat.label}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{cat.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Study Deck Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Word Card & Visual Flashcard (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Card Top Navigation & Sub-tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 text-sky-400 border border-slate-700">
                  WORD {currentWordIndex + 1} OF {categoryWords.length}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {currentWord?.partOfSpeech === 'N' ? 'Noun' : currentWord?.partOfSpeech === 'V' ? 'Verb' : currentWord?.partOfSpeech === 'Adj' ? 'Adjective' : 'Verb / Noun'}
                </span>
              </div>

              {/* View Switcher: Study Card vs Dialogue vs Checkpoint */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  id="tab-study-card"
                  onClick={() => setActiveTab('study')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeTab === 'study' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Vocabulary Card
                </button>
                {currentWord?.dialogue && (
                  <button
                    id="tab-dialogue"
                    onClick={() => setActiveTab('dialogue')}
                    className={`px-3 py-1 rounded-md font-medium transition-colors ${
                      activeTab === 'dialogue' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dialogue Simulation
                  </button>
                )}
                <button
                  id="tab-checkpoint-quiz"
                  onClick={() => setActiveTab('quiz')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors ${
                    activeTab === 'quiz' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Stage Quiz ({checkpointQuestions.length}Q)
                </button>
              </div>
            </div>

            {/* TAB 1: Main Vocabulary Study Card */}
            {activeTab === 'study' && currentWord && (
              <div className="space-y-6">
                {/* Photo & Term Header */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  <div className="md:col-span-5 relative group overflow-hidden rounded-xl aspect-[4/3] bg-slate-950 border border-slate-800">
                    <img
                      src={currentWord.imageUrl}
                      alt={currentWord.imageAlt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-[11px] text-slate-200 font-medium px-2 py-1 bg-slate-950/70 backdrop-blur rounded truncate">
                      📸 {currentWord.imageAlt}
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        {currentWord.category}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                        {currentWord.term}
                      </h3>
                      {currentWord.pronunciationIpa && (
                        <div className="text-xs font-mono text-sky-400 mt-0.5">
                          {currentWord.pronunciationIpa}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                      <HoverText text={currentWord.definition} translation={ptTranslations[currentWord.definition] || "Tradução não disponível."} />
                    </p>

                    {/* Audio Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        id={`btn-pronounce-${currentWord.id}`}
                        onClick={handlePlayPronunciation}
                        disabled={isPlayingAudio}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Volume2 className="w-4 h-4 text-sky-400" />
                        <span>Listen Pronunciation</span>
                      </button>

                      <button
                        id={`btn-announcement-${currentWord.id}`}
                        onClick={handlePlayAnnouncement}
                        disabled={isPlayingAudio}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Radio className="w-4 h-4 animate-pulse" />
                        <span>Simulate Airport PA Announcement</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Example Sentences from Diego Danner&apos;s text */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Real-World Examples (from Diego Danner&apos;s Lesson)</span>
                  </div>
                  <div className="space-y-2">
                    {currentWord.exampleSentences.map((example, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="italic font-medium">
                          <HoverText text={example} translation={ptTranslations[example] || "Tradução não disponível."} />
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro Tips / Did You Know */}
                {(currentWord.tip || currentWord.didYouKnow) && (
                  <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-800/60 text-xs text-sky-200 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">
                        {currentWord.tip ? 'Pro Tip: ' : 'Did you know? '}
                      </span>
                      <span>{currentWord.tip || currentWord.didYouKnow}</span>
                    </div>
                  </div>
                )}

                {/* Card Footer: Mastered Toggle & Next/Prev Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <button
                    id={`btn-master-${currentWord.id}`}
                    onClick={() => {
                      onMarkMastered(currentWord.id);
                      onAddXp(30, `Mastered "${currentWord.term}"`);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isCurrentMastered
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCurrentMastered ? 'Word Mastered ✓ (+30 XP)' : 'Mark as Mastered (+30 XP)'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      id="btn-prev-word"
                      onClick={handlePrevWord}
                      disabled={currentWordIndex === 0}
                      className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
                      title="Previous Word"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      id="btn-next-word"
                      onClick={handleNextWord}
                      disabled={currentWordIndex === categoryWords.length - 1}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-700 disabled:opacity-40 transition-colors text-xs font-bold"
                    >
                      <span>Next Term</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Dialogue Simulation */}
            {activeTab === 'dialogue' && currentWord?.dialogue && (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Airport Dialogue Interaction</span>
                  </div>
                  <div className="space-y-3">
                    {currentWord.dialogue.map((line, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl text-sm ${
                          line.speaker === 'Traveler' || line.speaker === 'Customer'
                            ? 'bg-sky-950/60 border border-sky-800/70 ml-6 text-sky-100'
                            : 'bg-slate-900 border border-slate-800 mr-6 text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-400 mb-1 flex items-center justify-between">
                          <span>{line.speaker}</span>
                          <button
                            onClick={() => soundEnabled && airportSpeech.speakTerm(line.text)}
                            className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                          >
                            <Volume2 className="w-3 h-3" /> Speak
                          </button>
                        </div>
                        <p className="font-medium">{line.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('study')}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Vocabulary Card
                </button>
              </div>
            )}

            {/* TAB 3: Checkpoint Stage Quiz */}
            {activeTab === 'quiz' && checkpointQuestions.length > 0 && (
              <div className="space-y-5 py-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                      Stage Checkpoint Test
                    </div>
                    <div className="text-sm font-black text-white">
                      Question {quizStep + 1} of {checkpointQuestions.length}
                    </div>
                  </div>
                  <div className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                    +25 XP per correct answer
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="text-base font-semibold text-slate-100 whitespace-pre-line">
                    {checkpointQuestions[quizStep]?.prompt}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {checkpointQuestions[quizStep]?.options.map((option, optIdx) => {
                      const isSelected = quizAnswerSelected === optIdx;
                      const isCorrect = optIdx === checkpointQuestions[quizStep]?.correctIdx;
                      let btnStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200';

                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-red-950 border-red-500 text-red-300 line-through';
                        } else {
                          btnStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-600';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          id={`quiz-opt-${optIdx}`}
                          disabled={quizSubmitted}
                          onClick={() => handleAnswerQuiz(optIdx)}
                          className={`p-3.5 rounded-xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="font-bold text-sky-400">Context & Example:</div>
                      <p className="italic">{checkpointQuestions[quizStep]?.explanation}</p>
                    </div>
                  )}
                </div>

                {quizSubmitted && (
                  <div className="flex justify-end">
                    <button
                      id="btn-quiz-next"
                      onClick={handleNextQuizQuestion}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/25 transition-all"
                    >
                      <span>
                        {quizStep < checkpointQuestions.length - 1 ? 'Next Question' : 'Finish Checkpoint (+120 XP)'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Category Terms List & Diego Danner Grammar Guide (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Terms in this Stage List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white">Stage Vocabulary</h4>
                <div className="text-[11px] text-slate-400">
                  {categoryProgress.mastered} of {categoryProgress.total} mastered
                </div>
              </div>
              <div className="text-xs font-mono font-bold text-sky-400">
                {categoryProgress.percent}%
              </div>
            </div>

            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
              {categoryWords.map((word, idx) => {
                const isSelected = currentWordIndex === idx;
                const isMastered = masteredWordIds.includes(word.id);
                return (
                  <button
                    key={word.id}
                    id={`list-word-${word.id}`}
                    onClick={() => {
                      playClickSound();
                      setCurrentWordIndex(idx);
                      setActiveTab('study');
                    }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-sky-950/80 border-sky-500 text-white font-bold'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 shrink-0 font-mono">
                        {idx + 1}
                      </span>
                      <span className="truncate">{word.term}</span>
                    </div>
                    {isMastered ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-slate-500 uppercase font-mono">
                        {word.partOfSpeech}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Diego Danner Grammar Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Essential Grammar Corner</span>
            </div>
            {GRAMMAR_TIPS.map((tip, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-200">{tip.title}</div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-mono">
                    {tip.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {tip.content}
                </p>
                <div className="p-2 rounded bg-slate-900 text-[10px] text-amber-300/90 font-mono italic">
                  💡 {tip.exampleDialogue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
