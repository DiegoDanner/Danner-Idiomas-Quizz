'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Loader2, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { AudioStreamer } from '@/lib/audio-utils';

interface LiveVoiceModeProps {
  onClose: () => void;
}

export default function LiveVoiceMode({ onClose }: LiveVoiceModeProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const sessionRef = useRef<any>(null);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

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
    setIsAiSpeaking(false);
    setCurrentSubtitle('');
  }, []);

  const startSession = useCallback(async () => {
    // Check if API key is selected (required for Gemini 3 series models)
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // After opening, we assume success as per guidelines
      }
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
    if (!apiKey) {
      setError("Gemini API Key not found. Please configure it in your environment.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      audioStreamerRef.current = new AudioStreamer((base64Data) => {
        if (sessionRef.current && !isMutedRef.current) {
          sessionRef.current.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      });

      // Hook into speech end event for precise subtitle control
      audioStreamerRef.current.setSpeechEndCallback(() => {
        setIsAiSpeaking(false);
        // We don't clear the text immediately to allow for a smooth fade out
        // The AnimatePresence handles the exit animation
      });

      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } },
          },
          systemInstruction: "You are Teacher Danner, a friendly and experienced English teacher from Brazil helping students learn English. You explain things simply, give examples, and encourage students. You never say you are an AI. You respond in English or Portuguese depending on the student. If the student writes in English, lightly and gently correct any mistakes before answering their question. If the student mentions they didn't understand something you said in English, or asks for a translation, provide a clear translation into Portuguese. Keep answers short, practical, and easy to understand. Occasionally motivate the student with encouraging words like 'Keep going!', 'You're doing great!', or 'Vamos lá!'.",
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            audioStreamerRef.current?.startCapture();
          },
          onmessage: async (message: LiveServerMessage) => {
            const parts = message.serverContent?.modelTurn?.parts;
            if (!parts) return;

            for (const part of parts) {
              if (part.inlineData?.data) {
                setIsAiSpeaking(true);
                await audioStreamerRef.current?.playAudioChunk(part.inlineData.data);
              }

              if (part.text) {
                const textPart = part.text;
                setCurrentSubtitle(prev => {
                  // If it's a new turn (AI wasn't speaking), replace. Otherwise append.
                  const newText = prev && isAiSpeaking ? prev + ' ' + textPart : textPart;
                  return newText;
                });
              }
            }

            if (message.serverContent?.interrupted) {
              console.log("AI Interrupted");
              setIsAiSpeaking(false);
              setCurrentSubtitle('');
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setError("Connection error. Please try again.");
            stopSession();
          },
          onclose: () => {
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
  }, [stopSession, isAiSpeaking]);


  const handleStart = async () => {
    setShowExplanation(false);
    await startSession();
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

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
        {/* Visualizer Placeholder */}
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
            {isConnecting ? "Connecting to Teacher Danner..." : isConnected ? "Talking to Teacher Danner" : "Connection Lost"}
          </h3>
          <p className="text-gray-400 text-sm">
            {isConnected ? "I'm listening! Speak naturally in English or Portuguese." : "Setting up your voice classroom..."}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm text-left">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

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

      {/* Subtitles Overlay */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center px-6 pointer-events-none">
        <AnimatePresence>
          {isAiSpeaking && currentSubtitle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="max-w-[70%] bg-black/60 backdrop-blur-sm border border-white/10 p-4 rounded-2xl shadow-2xl"
            >
              <p className="text-white text-lg md:text-xl font-medium leading-relaxed text-center drop-shadow-md">
                {currentSubtitle}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
