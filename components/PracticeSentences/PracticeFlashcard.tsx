'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, RotateCcw, Mic, MicOff, Check, X } from 'lucide-react';
import Image from 'next/image';
import { PracticeSentence } from '@/lib/practice-sentences-data';

interface PracticeFlashcardProps {
  sentence: PracticeSentence;
  startLanguage: 'english' | 'portuguese';
}

export default function PracticeFlashcard({ sentence, startLanguage }: PracticeFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
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
    const expected = sentence.english;
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

    if (score >= 0.85) {
      setFeedback('success');
      setTimeout(() => setIsFlipped(true), 1000);
    } else if (score >= 0.6) {
      setFeedback('almost');
      setTimeout(() => setIsFlipped(true), 1500);
    } else {
      setFeedback('error');
    }
  }, [sentence.english]);

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
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript;
      }
      finalTranscriptRef.current = fullText.trim();
      setTranscription(fullText.trim());
      hasUserSpokenRef.current = true;
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (finalTranscriptRef.current && hasUserSpokenRef.current) {
        validateResult(finalTranscriptRef.current);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
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
        } catch { /* ignore */ }
      }
    };
  }, [initRecognition]);

  const handleStartSentenceRecording = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
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
    } catch (_err) {
      initRecognition();
      setTimeout(() => {
        try { recognitionRef.current?.start(); } catch (e) { console.error(e); }
      }, 100);
    }
  };

  const handleStopSentenceRecording = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    try {
      recognitionRef.current?.stop();
    } catch { /* ignore */ }
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;

    const utterance = new SpeechSynthesisUtterance(sentence.english);
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
                          voices.find(v => v.lang === 'en-US') ||
                          voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const frontText = startLanguage === "english" ? sentence.english : sentence.portuguese;
  const backText = startLanguage === "english" ? sentence.portuguese : sentence.english;
  const showAudioOnFront = startLanguage === "english";
  const showAudioOnBack = startLanguage === "portuguese";

  // Reset flip state when sentence changes
  useEffect(() => {
    setIsFlipped(false);
    setTranscription('');
    setFeedback(null);
    finalTranscriptRef.current = '';
    hasUserSpokenRef.current = false;
  }, [sentence.id]);

  return (
    <div
      className="relative w-full max-w-md aspect-[3/4] perspective-1000 cursor-pointer"
      onClick={handleFlip}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white dark:bg-[#121a28] rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-[#424855]/10 flex flex-col overflow-hidden">
          <div className="relative w-full h-1/2 bg-gray-100 dark:bg-[#1d2636]">
            <Image
              src={`https://picsum.photos/seed/${sentence.imageKeyword}/400/300`}
              alt="Sentence visualization"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute top-4 left-6">
              <span className="text-[10px] font-mono text-white/80 uppercase tracking-[0.2em] font-bold drop-shadow-md">
                Practice Sentence
              </span>
            </div>
            {showAudioOnFront && (
              <button
                onClick={playAudio}
                disabled={isPlaying || isRecording}
                className="absolute top-4 right-4 p-3 rounded-2xl bg-black/20 text-white hover:bg-black/40 transition-all disabled:opacity-50"
                aria-label="Play audio"
              >
                <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative">
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc] leading-tight mb-4">
              {frontText}
            </h2>

            <div className="h-12 flex flex-col items-center justify-center w-full mb-8">
              {isRecording ? (
                <div className="flex space-x-2">
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 bg-[#6cb2ff] rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 bg-[#6cb2ff] rounded-full" />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 bg-[#6cb2ff] rounded-full" />
                </div>
              ) : transcription ? (
                <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium ${
                  feedback === 'success' ? 'bg-green-500/10 text-green-600' :
                  feedback === 'almost' ? 'bg-yellow-500/10 text-yellow-600' :
                  'bg-red-500/10 text-red-600'
                }`}>
                  {feedback === 'success' ? <Check size={14} /> : feedback === 'almost' ? <Check size={14} className="opacity-70" /> : <X size={14} />}
                  <span className="italic truncate max-w-[200px]">&quot;{transcription}&quot;</span>
                </div>
              ) : (
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hold to Practice Reading</p>
              )}
            </div>

            <div className="flex flex-col items-center">
              <button
                onMouseDown={handleStartSentenceRecording}
                onMouseUp={handleStopSentenceRecording}
                onMouseLeave={handleStopSentenceRecording}
                onTouchStart={handleStartSentenceRecording}
                onTouchEnd={handleStopSentenceRecording}
                onTouchCancel={handleStopSentenceRecording}
                onClick={(e) => e.stopPropagation()}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isRecording ? 'bg-red-500 scale-110 shadow-lg shadow-red-500/20' : 'bg-[#6cb2ff]/10 text-[#6cb2ff] hover:bg-[#6cb2ff]/20'}`}
              >
                {isRecording ? <MicOff size={24} className="text-white" /> : <Mic size={24} />}
              </button>
            </div>

            <p className="absolute bottom-6 left-8 text-[10px] uppercase tracking-[0.2em] text-gray-300 font-bold">
              Tap to Flip
            </p>
          </div>
        </div>

        {/* Back Side */}
        <div
          className="absolute inset-0 w-full h-full backface-hidden bg-gray-50 dark:bg-[#121a28] rounded-[2.5rem] shadow-2xl border border-[#6cb2ff]/20 p-10 flex flex-col items-center justify-between overflow-hidden [transform:rotateY(180deg)]"
        >
          <div className="w-full flex justify-between items-center">
            <span className="text-[10px] font-mono text-[#6cb2ff] uppercase tracking-[0.2em] font-bold">Translation</span>
            <button
              onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
              className="p-3 rounded-2xl bg-gray-100 dark:bg-[#1d2636] text-[#6cb2ff] hover:bg-white dark:hover:bg-[#252f3f] transition-all hover:rotate-180 duration-500"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
            <h2 className="text-3xl md:text-4xl font-headline font-bold leading-tight tracking-tight text-[#6cb2ff]">
              {backText}
            </h2>
          </div>

          <div className="w-full flex flex-col items-center relative">
            {showAudioOnBack && (
              <button
                onClick={playAudio}
                disabled={isPlaying}
                className="p-4 rounded-2xl bg-[#6cb2ff] text-[#002442] hover:bg-[#58a2f0] transition-all disabled:opacity-50 shadow-lg shadow-[#6cb2ff]/20"
                aria-label="Play audio"
              >
                <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
              </button>
            )}
             <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
              Tap to Flip Back
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
