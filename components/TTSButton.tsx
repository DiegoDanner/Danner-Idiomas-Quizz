'use client';

import { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';

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
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const data = await response.json();
      if (data.audio) {
        await playPCM(data.audio);
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
