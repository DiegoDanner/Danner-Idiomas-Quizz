'use client';

import { GlossaryWord } from '@/lib/stories';
import { X, Volume2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";

interface WordModalProps {
  wordId: string | null;
  onClose: () => void;
  glossary: Record<string, GlossaryWord>;
}

export default function WordModal({ wordId, onClose, glossary }: WordModalProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTTSSearching, setIsTTSSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!wordId) return null;

  const wordData = glossary[wordId];
  if (!wordData) return null;

  const speak = async (text: string) => {
    if (isTTSSearching || isSpeaking) return;

    setIsTTSSearching(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
      if (!apiKey) throw new Error("API Key not configured.");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/10 dark:bg-black/40 backdrop-blur-[2px] pointer-events-auto" onClick={onClose} />

      <div
        className="relative bg-[#fffdf8] dark:bg-[#121a28] rounded-sm shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 pointer-events-auto border border-[#e2d9c8] dark:border-[#424855]/20"
        role="dialog"
        aria-modal="true"
      >
        <div className="h-2 w-full bg-[#8b5a2b] dark:bg-[#6cb2ff]"></div>

        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#e5ebfc] font-serif capitalize flex items-center gap-2">
                {wordData.word}
                <button
                  onClick={() => speak(wordData.word)}
                  disabled={isTTSSearching}
                  className="p-1.5 text-[#8b5a2b] dark:text-[#6cb2ff] hover:bg-[#8b5a2b]/10 dark:hover:bg-[#6cb2ff]/10 rounded-full transition-colors"
                  aria-label="Listen to pronunciation"
                >
                  {isTTSSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                  )}
                </button>
              </h2>
              {wordData.pronunciation && (
                <p className="mt-1 text-sm font-mono text-gray-500 dark:text-[#a5abbb]">{wordData.pronunciation}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-[#e5ebfc] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full h-px bg-gray-200 dark:bg-[#424855]/20 my-2"></div>

          <div>
            <p className="text-lg text-gray-800 dark:text-[#e5ebfc] font-serif leading-relaxed">{wordData.definition}</p>
          </div>

          <div className="bg-[#f4f1ea] dark:bg-[#1d2636] p-3 rounded border-l-4 border-[#8b5a2b] dark:border-[#6cb2ff]">
            <p className="text-gray-700 dark:text-[#a5abbb] italic font-serif">&quot;{wordData.example}&quot;</p>
          </div>
        </div>
      </div>
    </div>
  );
}
