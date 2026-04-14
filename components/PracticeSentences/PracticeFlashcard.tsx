'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Volume2, Loader2, RotateCcw, Mic, MicOff, Check, X } from 'lucide-react';
import Image from 'next/image';
import { GoogleGenAI, Modality } from "@google/genai";
import { PracticeSentence } from '@/lib/practice-sentences-data';

interface PracticeFlashcardProps {
  sentence: PracticeSentence;
  startLanguage: 'english' | 'portuguese';
}

export default function PracticeFlashcard({ sentence, startLanguage }: PracticeFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

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
    setFinalSpokenText(cleanedSpoken);

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
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [initRecognition]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const playAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying || isLoadingAudio) return;

    setIsLoadingAudio(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
      if (!apiKey) {
        throw new Error("API Key not configured.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: sentence.english }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Charon' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("Failed to generate audio");
      }

      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const audioContext = audioContextRef.current;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        setIsPlaying(false);
      };
      setIsPlaying(true);
      source.start(0);
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const frontText = startLanguage === "english" ? sentence.english : sentence.portuguese;
  const backText = startLanguage === "english" ? sentence.portuguese : sentence.english;
  const showAudioOnFront = startLanguage === "english";
  const showAudioOnBack = startLanguage === "portuguese";

  const handleStartRecording = () => {
    setFeedback(null);
    setTranscription('');
    setFinalSpokenText("");
    finalTranscriptRef.current = '';
    hasUserSpokenRef.current = true;
    setIsRecording(true);
    try {
      recognitionRef.current?.start();
    } catch {
      initRecognition();
      setTimeout(() => {
        try { recognitionRef.current?.start(); } catch {
          // ignore
        }
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

  // Reset flip state when sentence changes
  useEffect(() => {
    setIsFlipped(false);
    setTranscription('');
    setFinalSpokenText("");
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
          </div>
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc] leading-tight mb-4">
              {frontText}
            </h2>

            <div className="h-32 flex flex-col items-center justify-center w-full">
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
                        <span className="font-mono text-[9px]">{Math.round((sentence.english.split(' ').filter(w => normalize(finalSpokenText).split(' ').includes(normalize(w))).length / sentence.english.split(' ').length) * 100)}% Match</span>
                      </div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                        {sentence.english.split(' ').map((word, i) => {
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

            <div className="absolute bottom-6 left-0 right-0 px-8 flex justify-between items-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                Tap to Flip
              </p>

              <div className="flex gap-2">
                {showAudioOnFront && (
                  <button
                    onClick={playAudio}
                    disabled={isLoadingAudio || isPlaying || isRecording}
                    className="p-3 rounded-2xl bg-[#6cb2ff]/10 text-[#6cb2ff] hover:bg-[#6cb2ff]/20 transition-all disabled:opacity-30"
                    aria-label="Play audio"
                  >
                    {isLoadingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />}
                  </button>
                )}
                <button
                  onMouseDown={(e) => { e.stopPropagation(); handleStartRecording(); }}
                  onMouseUp={(e) => { e.stopPropagation(); handleStopRecording(); }}
                  onMouseLeave={(e) => { e.stopPropagation(); handleStopRecording(); }}
                  onTouchStart={(e) => { e.stopPropagation(); handleStartRecording(); }}
                  onTouchEnd={(e) => { e.stopPropagation(); handleStopRecording(); }}
                  onTouchCancel={(e) => { e.stopPropagation(); handleStopRecording(); }}
                  onClick={(e) => e.stopPropagation()}
                  className={`p-3 rounded-2xl transition-all duration-300 ${isRecording ? 'bg-red-500 text-white scale-110 shadow-lg' : 'bg-[#6cb2ff]/10 text-[#6cb2ff] hover:bg-[#6cb2ff]/20'}`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
            </div>
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
                disabled={isLoadingAudio || isPlaying}
                className="p-4 rounded-2xl bg-[#6cb2ff] text-[#002442] hover:bg-[#58a2f0] transition-all disabled:opacity-50 shadow-lg shadow-[#6cb2ff]/20"
                aria-label="Play audio"
              >
                {isLoadingAudio ? <Loader2 className="w-6 h-6 animate-spin" /> : <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />}
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
