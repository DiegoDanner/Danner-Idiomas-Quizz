'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, PhoneOff, Loader2, Volume2, AlertCircle, Captions, Languages, CaptionsOff } from 'lucide-react';
import { AudioStreamer } from '@/lib/audio-utils';

interface LiveVoiceModeProps {
  onClose: () => void;
}

export default function LiveVoiceMode({ onClose }: LiveVoiceModeProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.5);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiTranscript, setAiTranscript] = useState<string>('');
  const [translatedTranscript, setTranslatedTranscript] = useState<string>('');
  
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const sessionRef = useRef<any>(null);
  const isMutedRef = useRef(isMuted);
  const isAiSpeakingRef = useRef(false);
  const lastAiMessageTimeRef = useRef<number>(0);

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
          generationConfig: {
            temperature: 0.7,
          },
          responseModalities: ["audio"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Algenib" } },
          },
          systemInstruction: {
            parts: [{ text: "You are Teacher Danner, a friendly and experienced English teacher from Brazil helping students learn English. You have a deep, slightly hoarse and gravelly male voice. You explain things simply, give examples, and encourage students. You never say you are an AI. You respond in English or Portuguese depending on the student. If the student writes in English, lightly and gently correct any mistakes before answering their question. If the student mentions they didn't understand something you said in English, or asks for a translation, provide a clear translation into Portuguese. Keep answers short, practical, and easy to understand. Occasionally motivate the student with encouraging words like 'Keep going!', 'You're doing great!', or 'Vamos lá!'." }]
          },
          inputAudioTranscription: { enabled: true },
        } as any,
        callbacks: {
          onopen: () => {
            console.log("Live API Connection Opened");
            setIsConnected(true);
            setIsConnecting(false);
            audioStreamerRef.current?.startCapture();
            audioStreamerRef.current?.setSpeechEndCallback(() => {
              isAiSpeakingRef.current = false;
            });
          },
          onmessage: (message: LiveServerMessage) => {
            // Check if this is a new model turn or a significant gap in time
            const now = Date.now();

            if (message.serverContent?.modelTurn) {
              // If AI hasn't spoken for 2+ seconds, treat as new caption block
              if (!isAiSpeakingRef.current || (now - lastAiMessageTimeRef.current > 2000)) {
                setAiTranscript('');
                setTranslatedTranscript('');
                isAiSpeakingRef.current = true;
              }
              lastAiMessageTimeRef.current = now;

              // Handle audio/text combinations correctly
              const parts = message.serverContent?.modelTurn?.parts || [];
              parts.forEach((part: any) => {
                if (part.text) {
                  setAiTranscript(prev => prev + part.text);
                }
                // Check for transcriptions in the message
                if (part.transcription?.text) {
                  setAiTranscript(part.transcription.text);
                } else if (part.transcription && typeof part.transcription === 'string') {
                  setAiTranscript(part.transcription);
                }
                if (part.inlineData?.data) {
                  audioStreamerRef.current?.playAudioChunk(part.inlineData.data);
                }
              });
            }

            if (message.serverContent?.interrupted) {
              setAiTranscript('');
              setTranslatedTranscript('');
              isAiSpeakingRef.current = false;
              console.log("AI Interrupted");
            }
          },
          onerror: (err) => {
            console.error("Live API Error Details:", JSON.stringify(err, null, 2));
            console.error("Live API Error Message:", err.message);
            setError(`Connection error: ${err.message || 'Check your internet or API key'}.`);
            stopSession();
          },
          onclose: (event: any) => {
            console.log("Live API Connection Closed:", event);
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

  useEffect(() => {
    if (!showTranslation || !aiTranscript.trim() || !isConnected) {
      setTranslatedTranscript('');
      return;
    }

    const timer = setTimeout(async () => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) return;

      try {
        const ai: any = new GoogleGenAI({ apiKey });
        // Use any to bypass TS error if the version in use is slightly different from typical @google/genai documentation
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`Translate the following English text to Portuguese. Provide only the translation, nothing else: "${aiTranscript.trim()}"`);
        const translation = result.response.text();
        setTranslatedTranscript(translation.trim());
      } catch (e) {
        console.error("Translation error:", e);
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [aiTranscript, showTranslation, isConnected]);

  const handleStart = async () => {
    if (audioStreamerRef.current) {
      try {
        // Create a silent audio element to help mobile browsers route audio to main speaker
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='; // 100ms silent wav
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
            {isConnecting ? "Connecting to Teacher Danner..." : isConnected ? "Teacher Danner" : "Connection Lost"}
          </h3>
          <p className="text-[#6cb2ff] font-medium text-sm">
            {isConnected ? "Live Voice Mode" : "Setting up your voice classroom..."}
          </p>
        </div>

        {/* Transcript Box */}
        <div className={`w-full bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[160px] flex flex-col items-center justify-center text-center shadow-inner overflow-hidden transition-all duration-500 ${!showCaptions ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <AnimatePresence mode="wait">
            {aiTranscript ? (
              <motion.div
                key="transcript-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <p className="text-gray-200 text-xl font-medium leading-relaxed">
                  &quot;{aiTranscript.trim()}&quot;
                </p>
                {showTranslation && translatedTranscript && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[#6cb2ff]/70 text-sm font-normal italic leading-tight"
                  >
                    {translatedTranscript}
                  </motion.p>
                )}
              </motion.div>
            ) : (
              <motion.p
                key="listening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-gray-500 text-lg italic animate-pulse"
              >
                {isConnected ? "Listening..." : "..."}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm text-left">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
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
              min="0"
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
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-3 rounded-full transition-all ${
              showCaptions ? 'bg-[#6cb2ff]/20 text-[#6cb2ff]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            title={showCaptions ? "Disable Captions" : "Enable Captions"}
          >
            {showCaptions ? <Captions className="w-5 h-5" /> : <CaptionsOff className="w-5 h-5" />}
          </button>

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

          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`p-3 rounded-full transition-all ${
              showTranslation ? 'bg-green-500/20 text-green-500' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            title={showTranslation ? "Hide Translation" : "Show Translation"}
          >
            <Languages className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
