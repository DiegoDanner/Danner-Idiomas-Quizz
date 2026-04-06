'use client';

import { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

interface TTSButtonProps {
  text: string;
  className?: string;
}

export default function TTSButton({ text, className = "" }: TTSButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const speak = async () => {
    if (isLoading || isPlaying) return;

    setIsLoading(true);
    try {
      // Check if API key is selected
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
      if (!apiKey) {
        throw new Error("API Key not configured.");
      }

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
      setIsLoading(false);
    }
  };

  const playPCM = async (base64Data: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Decode base64 to binary
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Convert to Float32 for AudioBuffer
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
    
    setIsPlaying(true);
    source.onended = () => {
      setIsPlaying(false);
      audioContext.close();
    };
    
    source.start(0);
  };

  return (
    <button
      onClick={speak}
      disabled={isLoading}
      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-[#6cb2ff] disabled:opacity-50 ${className}`}
      title="Listen to pronunciation"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
      )}
    </button>
  );
}
