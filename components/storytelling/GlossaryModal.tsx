'use client';

import { GlossaryWord } from '@/lib/stories';
import { BookA, Volume2, X, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWordClick: (id: string) => void;
  glossary: Record<string, GlossaryWord>;
}

export default function GlossaryModal({ isOpen, onClose, onWordClick, glossary }: GlossaryModalProps) {
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isTTSSearching, setIsTTSSearching] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const words = Object.values(glossary).sort((a, b) => a.word.localeCompare(b.word));

  const speak = async (text: string, wordId: string) => {
    if (isTTSSearching || isSpeaking) return;

    setIsTTSSearching(wordId);
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
        await playPCM(base64Audio, wordId);
      }
    } catch (error) {
      console.error("Error in TTS:", error);
    } finally {
      setIsTTSSearching(null);
    }
  };

  const playPCM = async (base64Data: string, wordId: string) => {
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
    setIsSpeaking(wordId);
    source.onended = () => {
      setIsSpeaking(null);
      audioContext.close();
    };
    source.start(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

      <div
        className="relative bg-[#fffdf8] dark:bg-[#080e1a] rounded-sm shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200 pointer-events-auto border border-[#e2d9c8] dark:border-[#424855]/20"
        role="dialog"
        aria-modal="true"
      >
        <div className="h-2 w-full bg-[#8b5a2b] dark:bg-[#6cb2ff]"></div>
        <div className="flex items-center justify-between p-6 border-b border-[#e2d9c8] dark:border-[#424855]/20 bg-[#f4f1ea] dark:bg-[#121a28]">
          <h2 className="text-2xl font-bold text-[#5c3a21] dark:text-[#e5ebfc] font-serif flex items-center gap-3">
            <BookA className="w-6 h-6" />
            Glossary
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-[#8b5a2b] dark:hover:text-[#6cb2ff] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid gap-4 md:grid-cols-2">
            {words.map((wordData) => (
              <div
                key={wordData.id}
                className="bg-white dark:bg-[#121a28] p-4 rounded-sm shadow-sm border border-[#e2d9c8] dark:border-[#424855]/20 hover:border-[#8b5a2b] dark:hover:border-[#6cb2ff] hover:shadow-md transition-all cursor-pointer group"
                onClick={() => {
                  onClose();
                  onWordClick(wordData.id);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5ebfc] font-serif capitalize group-hover:text-[#8b5a2b] dark:group-hover:text-[#6cb2ff] transition-colors">
                    {wordData.word}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(wordData.word, wordData.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-[#8b5a2b] dark:hover:text-[#6cb2ff] hover:bg-[#f4f1ea] dark:hover:bg-[#1d2636] rounded-full transition-colors"
                    aria-label={`Listen to ${wordData.word}`}
                    disabled={isTTSSearching !== null}
                  >
                    {isTTSSearching === wordData.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Volume2 className={`w-4 h-4 ${isSpeaking === wordData.id ? 'animate-pulse' : ''}`} />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-[#a5abbb] font-serif line-clamp-2">{wordData.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
