'use client';

import { useState } from 'react';
import { PageData, GlossaryWord } from '@/lib/stories';
import InteractiveWord from './InteractiveWord';
import Image from 'next/image';
import { Volume2, Loader2 } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

interface PageProps {
  page: PageData;
  onWordClick: (_id: string) => void;
  isLeftPage?: boolean;
  glossary: Record<string, GlossaryWord>;
  displayType?: 'image' | 'text';
}

export default function Page({ page, onWordClick, isLeftPage, glossary, displayType }: PageProps) {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTTSSearching, setIsTTSSearching] = useState(false);

  const imgSrc = imgError ? '/images/storytelling/cover.jpg' : page.imageUrl;

  const speak = async (text: string) => {
    if (isTTSSearching || isSpeaking) return;

    setIsTTSSearching(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
      if (!apiKey) throw new Error("API Key not configured.");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
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

      if (base64Audio) {
        await playPCM(base64Audio);
      }
    } catch (error) {
      console.error("Error in TTS:", error);
    } finally {
      setIsTTSSearching(false);
    }
  };

  const playPCM = async (base64Data: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
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
    setIsSpeaking(true);
    source.onended = () => {
      setIsSpeaking(false);
      audioContext.close();
    };
    source.start(0);
  };

  if (displayType === 'image') {
    return (
      <div className="w-full h-full relative bg-[#f4f1ea] dark:bg-[#121a28]">
        {isLoading && (
          <div className="absolute inset-0 animate-pulse bg-[#e2d9c8] dark:bg-[#1d2636]"></div>
        )}
        <Image
          src={imgSrc}
          alt={page.imageAlt}
          fill
          className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImgError(true);
            setIsLoading(false);
          }}
        />
        <div className={`absolute bottom-4 ${isLeftPage ? 'left-6' : 'right-6'} text-white font-serif text-xs md:text-sm drop-shadow-md`}>
          {page.id}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ overflow: 'hidden', padding: '48px', boxSizing: 'border-box' }}
    >
      <div className="flex-1 flex flex-col justify-center relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            speak(page.rawText);
          }}
          className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-[#8b5a2b] dark:hover:text-[#6cb2ff] transition-colors z-10"
          aria-label="Read page aloud"
          disabled={isTTSSearching}
        >
          {isTTSSearching ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Volume2 className={`w-6 h-6 ${isSpeaking ? 'animate-pulse' : ''}`} />
          )}
        </button>

        <div
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-800 dark:text-[#e5ebfc] font-serif leading-relaxed"
          style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
        >
          {page.content.map((segment, index) => {
            if (segment.isWord && segment.wordId) {
              return (
                <InteractiveWord
                  key={index}
                  wordId={segment.wordId}
                  text={segment.text}
                  onWordClick={onWordClick}
                  glossary={glossary}
                />
              );
            }
            return <span key={index}>{segment.text}</span>;
          })}
        </div>
      </div>

      <div className={`absolute bottom-4 ${isLeftPage ? 'left-6' : 'right-6'} text-gray-400 font-serif text-xs md:text-sm`}>
        {page.id}
      </div>
    </div>
  );
}
