'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Mic, MicOff, Check, X, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { Phrase } from '@/lib/doctor-phrases-data';

interface FlashcardProps {
  phrase: Phrase;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isCompleted: boolean;
  onComplete: () => void;
}

export default function Flashcard({ phrase, onNext, onPrevious, isFirst, isLast, isCompleted, onComplete }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [finalSpokenText, setFinalSpokenText] = useState("");
  const [feedback, setFeedback] = useState<'success' | 'almost' | 'error' | null>(null);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const hasUserSpokenRef = useRef(false);

  const normalize = (text: string) =>
    text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

  const removeRepeatedWords = (text: string) => {
    const words = text.split(" ");
    const filtered = [];
    for (let i = 0; i < words.length; i++) {
      if (words[i] !== words[i - 1]) {
        filtered.push(words[i]);
      }
    }
    return filtered.join(" ");
  };

  const validateResult = useCallback((spokenText: string) => {
    const expected = phrase.english;
    const normalizedExpected = normalize(expected);
    const cleanedSpoken = removeRepeatedWords(normalize(spokenText));

    if (cleanedSpoken === "") return;

    const expectedWords = normalizedExpected.split(" ");
    const spokenWords = cleanedSpoken.split(" ");

    let matches = 0;
    expectedWords.forEach(word => {
      if (spokenWords.includes(word)) {
        matches++;
      }
    });

    const score = matches / expectedWords.length;
    console.log("VALIDATION - Score:", score, "Spoken:", cleanedSpoken, "Expected:", normalizedExpected);
    setFinalSpokenText(cleanedSpoken);

    if (score >= 0.85) {
      setFeedback('success');
      onComplete();
      setTimeout(() => setIsFlipped(true), 1000);
    } else if (score >= 0.6) {
      setFeedback('almost');
      onComplete();
      setTimeout(() => setIsFlipped(true), 1500);
    } else {
      setFeedback('error');
    }
  }, [phrase.english, onComplete]);

  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let fullText = "";
      // Capture EVERYTHING from the beginning of the results array
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript;
      }

      // Update ref and state immediately with the full accumulated transcript
      finalTranscriptRef.current = fullText.trim();
      setTranscription(fullText.trim());
      hasUserSpokenRef.current = true;
    };

    recognition.onend = () => {
      setIsRecording(false);
      // Fallback on onend: If transcript exists and user intended to speak -> validate
      if (finalTranscriptRef.current && hasUserSpokenRef.current) {
        validateResult(finalTranscriptRef.current);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        console.error("Speech recognition error:", event.error);
        setFeedback('error');
      }
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, [validateResult]);

  useEffect(() => {
    initRecognition();
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [initRecognition]);

  const playTTS = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase.english);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [phrase.english]);

  useEffect(() => {
    setIsFlipped(false);
    setTranscription('');
    setFinalSpokenText("");
    setFeedback(null);
    finalTranscriptRef.current = '';
    hasUserSpokenRef.current = false;

    const timer = setTimeout(() => {
      playTTS();
    }, 500);
    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [phrase.id, playTTS]);

  const handleStartRecording = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setFeedback(null);
    setTranscription('');
    finalTranscriptRef.current = '';
    hasUserSpokenRef.current = true;
    setIsRecording(true);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.error("Error starting recognition:", e);
      // Try re-initializing if it failed
      initRecognition();
      setTimeout(() => {
        try { recognitionRef.current?.start(); } catch (err) { console.error("Retry failed:", err); }
      }, 100);
    }
  };

  const handleStopRecording = () => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <div className="relative h-[400px] w-full transition-all duration-500 preserve-3d">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ rotateY: -180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 180, opacity: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute inset-0 w-full h-full bg-gray-50 dark:bg-[#121a28] rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-[#424855]/10 p-10 flex flex-col items-center justify-between overflow-hidden backface-hidden"
            >
              <div className="w-full flex justify-between items-center">
                <span className="text-[10px] font-mono text-gray-500 dark:text-[#a5abbb] uppercase tracking-[0.2em] font-bold">Medical English</span>
                <button
                  onClick={playTTS}
                  disabled={isSpeaking || isRecording}
                  className={`p-3 rounded-2xl transition-all duration-300 ${(isSpeaking || isRecording) ? 'bg-gray-100 dark:bg-[#1d2636] text-gray-400 opacity-50' : 'bg-gray-100 dark:bg-[#1d2636] text-[#6cb2ff] hover:bg-white dark:hover:bg-[#252f3f] hover:scale-110'}`}
                >
                  <Volume2 size={24} className={isSpeaking ? 'animate-pulse' : ''} />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 w-full">
                <h2 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc] leading-[1.1] tracking-tight">
                  {phrase.english}
                </h2>

                <div className="h-28 flex flex-col items-center justify-center w-full">
                  {isRecording ? (
                    <div className="flex space-x-2">
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2.5 h-2.5 bg-[#6cb2ff] rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2.5 h-2.5 bg-[#6cb2ff] rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2.5 h-2.5 bg-[#6cb2ff] rounded-full" />
                    </div>
                  ) : transcription ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center space-y-3 w-full max-w-sm">
                      <div className={`flex items-center space-x-3 px-6 py-2 rounded-2xl text-sm font-medium backdrop-blur-md ${
                        feedback === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                        feedback === 'almost' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20' :
                        'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}>
                        {feedback === 'success' ? <Check size={16} /> : feedback === 'almost' ? <Check size={16} className="opacity-70" /> : <X size={16} />}
                        <div className="flex flex-col items-start">
                          {feedback === 'almost' && <span className="text-[10px] font-bold uppercase tracking-tight opacity-70">Almost correct</span>}
                          <span className="italic line-clamp-1">&quot;{transcription}&quot;</span>
                        </div>
                      </div>

                      {finalSpokenText && (
                        <div className="w-full bg-gray-100/50 dark:bg-[#1d2636]/50 rounded-xl p-3 text-[10px] space-y-1 text-left border border-gray-200/50 dark:border-white/5">
                          <div className="flex justify-between items-center opacity-60">
                            <span className="font-bold uppercase tracking-widest">You said:</span>
                            <span className="font-mono text-[9px]">{Math.round((phrase.english.split(' ').filter(w => normalize(finalSpokenText).split(' ').includes(normalize(w))).length / phrase.english.split(' ').length) * 100)}% Match</span>
                          </div>
                          <p className="font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                            {phrase.english.split(' ').map((word, i) => {
                              const normWord = normalize(word);
                              const isMatch = normalize(finalSpokenText).split(' ').includes(normWord);
                              return (
                                <span key={i} className={isMatch ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400 font-bold underline decoration-red-500/30'}>
                                  {word}{' '}
                                </span>
                              );
                            })}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-[#a5abbb] font-medium tracking-wide">Read aloud to unlock translation</p>
                  )}
                </div>
              </div>

              <div className="w-full flex flex-col items-center space-y-6">
                {isCompleted && !isRecording && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={onNext}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-green-500/30 transition-all"
                  >
                    <span>{isLast ? 'Finish Practice' : 'Proceed to Next'}</span>
                    <ChevronRight size={16} />
                  </motion.button>
                )}
                <button
                  onMouseDown={(e) => { e.preventDefault(); handleStartRecording(); }}
                  onMouseUp={(e) => { e.preventDefault(); handleStopRecording(); }}
                  onMouseLeave={(e) => { e.preventDefault(); handleStopRecording(); }}
                  onTouchStart={(e) => { e.preventDefault(); handleStartRecording(); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleStopRecording(); }}
                  onTouchCancel={(e) => { e.preventDefault(); handleStopRecording(); }}
                  className={`relative w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-[#6cb2ff] hover:bg-[#58a2f0] shadow-[0_0_20px_rgba(108,178,255,0.3)] hover:scale-105'}`}
                >
                  {isRecording ? <MicOff size={28} className="text-white" /> : <Mic size={28} className="text-[#002442]" />}
                  {isRecording && (
                    <motion.div initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 1.8, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.2 }} className="absolute inset-0 bg-red-500 rounded-[2rem]" />
                  )}
                </button>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 dark:text-[#a5abbb] font-black">
                  {isRecording ? 'Listening...' : 'Hold to speak'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -180, opacity: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute inset-0 w-full h-full bg-gray-50 dark:bg-[#121a28] rounded-[2.5rem] shadow-2xl border border-[#6cb2ff]/20 p-10 flex flex-col items-center justify-between overflow-hidden backface-hidden"
            >
              <div className="w-full flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#6cb2ff] uppercase tracking-[0.2em] font-bold">Translation</span>
                <button
                  onClick={() => setIsFlipped(false)}
                  className="p-3 rounded-2xl bg-gray-100 dark:bg-[#1d2636] text-[#6cb2ff] hover:bg-white dark:hover:bg-[#252f3f] transition-all hover:rotate-180 duration-500"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
                <h2 className="text-3xl md:text-4xl font-headline font-bold leading-[1.1] tracking-tight text-[#6cb2ff]">
                  {phrase.portuguese}
                </h2>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="mt-10 flex items-center space-x-3 text-green-600 dark:text-green-400/80 text-sm font-bold uppercase tracking-widest">
                  <div className="w-8 h-[1px] bg-green-600/30 dark:bg-green-400/30" />
                  <span>Unlocked</span>
                  <div className="w-8 h-[1px] bg-green-600/30 dark:bg-green-400/30" />
                </motion.div>
              </div>

              <div className="w-full flex justify-between items-center pt-6">
                <button onClick={onPrevious} disabled={isFirst} className={`flex items-center space-x-3 text-sm font-bold uppercase tracking-widest transition-all ${isFirst ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-500 dark:text-[#a5abbb] hover:text-[#6cb2ff]'}`}>
                  <ChevronLeft size={24} />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button onClick={onNext} disabled={isLast} className={`flex items-center space-x-3 text-sm font-bold uppercase tracking-widest transition-all ${isLast ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-500 dark:text-[#a5abbb] hover:text-[#6cb2ff]'}`}>
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
