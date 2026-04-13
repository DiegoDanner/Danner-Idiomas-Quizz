'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, Loader2, RotateCcw } from 'lucide-react';
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

  // Reset flip state when sentence changes
  useEffect(() => {
    setIsFlipped(false);
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
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center relative">
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc] leading-tight">
              {frontText}
            </h2>
            {showAudioOnFront && (
              <button
                onClick={playAudio}
                disabled={isLoadingAudio || isPlaying}
                className="absolute bottom-6 right-6 p-3 rounded-2xl bg-[#6cb2ff]/10 text-[#6cb2ff] hover:bg-[#6cb2ff]/20 transition-all disabled:opacity-50"
                aria-label="Play audio"
              >
                {isLoadingAudio ? <Loader2 className="w-6 h-6 animate-spin" /> : <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />}
              </button>
            )}
            <p className="absolute bottom-6 left-8 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
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
