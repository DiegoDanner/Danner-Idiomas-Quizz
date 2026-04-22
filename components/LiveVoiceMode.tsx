'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { motion } from 'motion/react';
import { Mic, MicOff, PhoneOff, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { AudioStreamer } from '@/lib/audio-utils';

interface LiveVoiceModeProps {
  onClose: () => void;
}

export default function LiveVoiceMode({ onClose }: LiveVoiceModeProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(2.5); // Default to 250% boost
  const [error, setError] = useState<string | null>(null);
  
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const sessionRef = useRef<any>(null);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    audioStreamerRef.current = new AudioStreamer((base64Data) => {
      if (sessionRef.current && !isMutedRef.current) {
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      }
    });
  }, []);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    audioStreamerRef.current?.setVolume(volume);
  }, [volume]);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {
        console.error("Error closing session:", e);
      }
      sessionRef.current = null;
    }
    audioStreamerRef.current?.stopCapture();
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const startSession = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      setError("Gemini API Key not found. Please configure it in your environment.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const session = await ai.live.connect({
        model: "gemini-2.0-flash-exp",
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are Teacher Danner, a friendly and experienced English teacher from Brazil helping students learn English. You have a deep, slightly hoarse and gravelly male voice. You explain things simply, give examples, and encourage students. You never say you are an AI. You respond in English or Portuguese depending on the student. If the student writes in English, lightly and gently correct any mistakes before answering their question. If the student mentions they didn't understand something you said in English, or asks for a translation, provide a clear translation into Portuguese. Keep answers short, practical, and easy to understand. Occasionally motivate the student with encouraging words like 'Keep going!', 'You're doing great!', or 'Vamos lá!'.",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Algenib" } },
          },
          generationConfig: {
            temperature: 0.7,
          }
        },
        callbacks: {
          onopen: () => {
            console.log("Live API connected");
            setIsConnected(true);
            setIsConnecting(false);
            audioStreamerRef.current?.startCapture();
          },
          onmessage: (message: LiveServerMessage) => {
            const audioData = message.data;
            if (audioData) {
              audioStreamerRef.current?.playAudioChunk(audioData);
            }
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            setError(`Connection error: ${err.message || 'Check your internet or API key'}`);
            setIsConnected(false);
            setIsConnecting(false);
            stopSession();
          },
          onclose: (event: any) => {
            console.log("Live API Closed:", event);
            setIsConnected(false);
            setIsConnecting(false);
            stopSession();
          }
        }
      });

      sessionRef.current = session;
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(`Failed to connect: ${err.message}`);
      setIsConnecting(false);
    }
  }, [stopSession]);

  useEffect(() => {
    if (!showExplanation) {
      startSession();
    }
    return () => {
      stopSession();
    };
  }, [startSession, stopSession, showExplanation]);

  const handleStart = async () => {
    if (audioStreamerRef.current) {
      try {
        // Force routing trick
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        audio.play().catch(() => {});
        await audioStreamerRef.current.init();
      } catch (e) {
        console.error("Failed to initialize audio context:", e);
      }
    }
    setShowExplanation(false);
  };

  if (showExplanation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute inset-0 bg-[#0d1117] z-50 flex flex-col items-center justify-center p-8 text-center"
      >
        <div className="w-20 h-20 bg-[#6cb2ff]/20 rounded-3xl flex items-center justify-center mb-6">
          <Mic className="w-10 h-10 text-[#6cb2ff]" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Voice Classroom</h3>
        <h4 className="text-lg font-medium text-[#6cb2ff] mb-4">Sala de Aula por Voz</h4>
        <div className="space-y-4 mb-8">
          <p className="text-gray-400 leading-relaxed">
            You can speak directly with Teacher Danner! Practice your pronunciation and conversation skills in real-time.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed italic">
            Você pode falar diretamente com o Professor Danner! Pratique sua pronúncia e habilidades de conversação em tempo real.
          </p>
        </div>
        <div className="flex flex-col w-full gap-3">
          <button
            onClick={handleStart}
            className="w-full py-4 bg-[#6cb2ff] text-white rounded-2xl font-bold hover:bg-[#6cb2ff]/80 transition-all shadow-lg shadow-[#6cb2ff]/20 flex flex-col items-center justify-center"
          >
            <span>Start Speaking</span>
            <span className="text-xs opacity-80 font-medium">Começar a Falar</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 bg-white/5 text-gray-400 rounded-2xl font-bold hover:bg-white/10 transition-all flex flex-col items-center justify-center"
          >
            <span>Maybe Later</span>
            <span className="text-xs opacity-60 font-medium">Talvez Depois</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 bg-[#0d1117] z-50 flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="absolute top-4 right-4">
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400"
        >
          <PhoneOff className="w-6 h-6 text-red-500" />
        </button>
      </div>

      <div className="space-y-8 w-full max-w-sm">
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <motion.div
            animate={{
              scale: isConnected ? [1, 1.2, 1] : 1,
              opacity: isConnected ? [0.3, 0.6, 0.3] : 0.3,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-[#6cb2ff] rounded-full blur-3xl"
          />
          <div className="relative w-32 h-32 bg-[#161b22] border-2 border-[#6cb2ff]/50 rounded-full flex items-center justify-center shadow-2xl">
            {isConnecting ? (
              <Loader2 className="w-12 h-12 text-[#6cb2ff] animate-spin" />
            ) : isConnected ? (
              <Volume2 className="w-12 h-12 text-[#6cb2ff] animate-pulse" />
            ) : (
              <MicOff className="w-12 h-12 text-gray-600" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">
            {isConnecting ? "Connecting to Teacher Danner..." : isConnected ? "Teacher Danner" : "Connection Lost"}
          </h3>
          <p className="text-[#6cb2ff] font-medium text-sm">
            {isConnected ? "Live Voice Mode" : "Setting up your voice classroom..."}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex flex-col gap-2 text-red-500 text-sm text-left">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="font-bold">Connection Issue</p>
            </div>
            <p className="opacity-80">{error}</p>
            <button
              onClick={() => { setError(null); startSession(); }}
              className="mt-2 py-2 px-4 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors self-start font-bold"
            >
              Try Reconnecting
            </button>
          </div>
        )}

        {/* Volume Slider */}
        <div className="w-full space-y-2 px-4">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span>Volume Boost</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="1"
              max="4"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#6cb2ff]"
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 pt-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all ${
              isMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button
            onClick={onClose}
            className="p-6 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
          >
            <PhoneOff className="w-8 h-8" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
