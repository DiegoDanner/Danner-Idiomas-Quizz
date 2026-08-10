'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, PhoneOff, Loader2, Volume2 } from 'lucide-react';
import { AudioStreamer } from '@/lib/audio-utils';

interface LiveVoiceModeProps {
  onClose: () => void;
}

export default function LiveVoiceMode({ onClose }: LiveVoiceModeProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(2.0); // Default 200%
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
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

  const addLog = useCallback((msg: string) => {
    console.log(`[LiveMode] ${msg}`);
    setLogs(prev => [msg, ...prev].slice(0, 5));
  }, []);

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
      setError("Gemini API Key missing.");
      return;
    }

    setIsConnecting(true);
    setError(null);
    addLog("Fetching ephemeral token...");

    try {
      const tokenRes = await fetch('/api/live-token');
      if (!tokenRes.ok) {
        const errData = await tokenRes.json();
        throw new Error(errData.error || "Failed to fetch token");
      }

      const { token } = await tokenRes.json();
      addLog("[Live] Token OK");
      addLog("Token fetched. Connecting to Live API...");
      
      const ai = new GoogleGenAI({ apiKey: token });

      addLog("Calling ai.live.connect()...");
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          systemInstruction: {
            parts: [{ text: "You are Teacher Danner, a friendly English teacher from Brazil helping students learn English. You have a deep, slightly hoarse and gravelly male voice. Explain things simply. Use English mostly, but Portuguese if needed. Be encouraging and focus on meaningful communication. Do not correct trivial errors like capitalization or punctuation unless it significantly changes the meaning." }]
          },
          temperature: 0.7,
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } },
          },
        } as any,
        callbacks: {
          onopen: () => {
            addLog("Connection Opened");
            addLog("[Live] WebSocket OPEN");
            setIsConnected(true);
            setIsConnecting(false);
            audioStreamerRef.current?.startCapture();


          },
          onmessage: (message: LiveServerMessage) => {
            const audioData = message.data;
            // The audio data might be inside message.serverContent.modelTurn.parts depending on how @google/genai parses it for live
            // Or message.serverContent directly. Memory says:
            // "The gemini-3.1-flash-live-preview model is used for the Multimodal Live API. For robustness, WebSocket messages should be parsed by searching the message.serverContent.modelTurn.parts array for inlineData (audio) or text (transcripts) using .find(), rather than relying on fixed indices."
            let parsedAudioData = audioData;

            // Check based on memory rule
            if (!parsedAudioData && message.serverContent?.modelTurn?.parts) {
                const inlineDataPart = message.serverContent.modelTurn.parts.find(p => p.inlineData);
                if (inlineDataPart?.inlineData?.data) {
                    parsedAudioData = inlineDataPart.inlineData.data;
                }
            }

            if (parsedAudioData) {
              addLog("[Live] Playback started");
              audioStreamerRef.current?.playAudioChunk(parsedAudioData);
            } else {
               addLog(`[Live] Server message received: ${JSON.stringify(Object.keys(message))}`);
            }

            if (message.serverContent?.interrupted) {
              addLog("Interrupted");

              if (audioStreamerRef.current) {
                audioStreamerRef.current.stopPlayback?.();
              }
            }
          },
          onerror: (err: any) => {
            addLog(`WebSocket Error: ${err.message || "Unknown"}`);
            console.error("LiveVoiceMode onerror payload:", err);
            let displayError = err.message || 'Check internet connection';
            if (displayError.includes('not found') || displayError.includes('deprecated')) {
              displayError = 'Model unavailable. Please update the app.';
            }
            setError(`Connection lost: ${displayError}`);
            stopSession();
          },
          onclose: (event: any) => {
            addLog(`WebSocket Closed: code=${event.code} reason=${event.reason}`);
            console.log("LiveVoiceMode onclose event:", event);
            setIsConnected(false);
            setIsConnecting(false);
            stopSession();
          }
        }
      });

      addLog("Live session connected successfully.");
      sessionRef.current = session;
    } catch (err: any) {
      addLog(`Connection Failed: ${err.message}`);
      console.error("LiveVoiceMode connection catch block:", err);
      setError(`Failed to connect: ${err.message}`);
      setIsConnecting(false);
    }
  }, [stopSession, addLog]);

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
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        audio.play().catch(() => {});
        await audioStreamerRef.current.init();
      } catch (e) {
        console.error("Audio init error:", e);
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
        <p className="text-gray-400 mb-8">Practice English conversation with Teacher Danner.</p>
        <button
          onClick={handleStart}
          className="w-full py-4 bg-[#6cb2ff] text-white rounded-2xl font-bold hover:bg-[#6cb2ff]/80 transition-all"
        >
          Start Speaking
        </button>
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
            {isConnecting ? "Connecting..." : isConnected ? "Teacher Danner" : "Connection Lost"}
          </h3>
          {!isConnected && !isConnecting && (
            <button
              onClick={() => { setError(null); startSession(); }}
              className="mt-2 px-4 py-1.5 bg-[#6cb2ff]/20 text-[#6cb2ff] rounded-full text-xs font-bold hover:bg-[#6cb2ff]/30 transition-all flex items-center gap-2 mx-auto"
            >
              <Loader2 className="w-3 h-3" />
              <span>Retry Connection</span>
            </button>
          )}
        </div>

        {/* Listening Indicator */}
        <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[80px] flex items-center justify-center text-center shadow-inner overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-gray-500 italic animate-pulse"
            >
              {isConnected ? "Listening for your voice..." : "..."}
            </motion.p>
          </AnimatePresence>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 text-xs">
            <p>{error}</p>
          </div>
        )}

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

        <div className="flex items-center justify-center gap-4 pt-4">
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

        {logs.length > 0 && (
          <div className="text-[9px] text-gray-600 font-mono text-left opacity-30 max-h-12 overflow-hidden">
            {logs.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
