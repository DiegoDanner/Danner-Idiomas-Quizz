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
  const [volume, setVolume] = useState(3.0);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTechnicalLogs, setShowTechnicalLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [audioRoutingHelp, setAudioRoutingHelp] = useState(false);
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

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 50));
  }, []);

  const startSession = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      setError("Gemini API Key not found. Please configure it in your environment.");
      return;
    }

    setIsConnecting(true);
    setError(null);
    setLogs(["Connecting..."]);

    try {
      const ai = new GoogleGenAI({ apiKey });
      addLog("Initializing Gemini Live...");
      
      const session = await ai.live.connect({
        model: "gemini-2.0-flash-exp",
        config: {
          generationConfig: {
            temperature: 0.7,
            responseModalities: ["AUDIO" as any],
          },
          systemInstruction: {
            parts: [{ text: "You are Teacher Danner, a friendly and experienced English teacher from Brazil helping students learn English. You have a deep, slightly hoarse and gravelly male voice. You explain things simply, give examples, and encourage students. You never say you are an AI. You respond in English or Portuguese depending on the student. If the student writes in English, lightly and gently correct any mistakes before answering their question. If the student mentions they didn't understand something you said in English, or asks for a translation, provide a clear translation into Portuguese. Keep answers short, practical, and easy to understand. Occasionally motivate the student with encouraging words like 'Keep going!', 'You're doing great!', or 'Vamos lá!'." }]
          },
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Algenib" } },
          },
          inputAudioTranscription: { enabled: true },
          outputAudioTranscription: { enabled: true },
        } as any,
        callbacks: {
          onopen: () => {
            addLog("Connection Opened");
            setIsConnected(true);
            setIsConnecting(false);
            audioStreamerRef.current?.startCapture();
            audioStreamerRef.current?.setSpeechEndCallback(() => {
              isAiSpeakingRef.current = false;
            });
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.setupComplete) {
              addLog("Setup Complete: " + message.setupComplete.sessionId);
            }

            // Check for audio data using the helper getter
            const audioData = message.data;
            if (audioData) {
              if (!isAiSpeakingRef.current) addLog("AI Speaking...");
              isAiSpeakingRef.current = true;
              lastAiMessageTimeRef.current = Date.now();
              audioStreamerRef.current?.playAudioChunk(audioData);
            }

            // Handle independent transcription messages
            if (message.serverContent?.outputTranscription?.text) {
              setAiTranscript(message.serverContent.outputTranscription.text);
              isAiSpeakingRef.current = true;
              lastAiMessageTimeRef.current = Date.now();
            }

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

              // Handle transcriptions in model turns
              const parts = message.serverContent?.modelTurn?.parts || [];
              parts.forEach((part: any) => {
                if (part.text) {
                  setAiTranscript(prev => prev + part.text);
                }
                if (part.transcription?.text) {
                  setAiTranscript(part.transcription.text);
                }
              });
            }

            if (message.serverContent?.interrupted) {
              addLog("Interrupted");
              setAiTranscript('');
              setTranslatedTranscript('');
              isAiSpeakingRef.current = false;
            }
          },
          onerror: (err: any) => {
            addLog("Error: " + (err.message || "Unknown error"));
            setError(`Connection error: ${err.message || 'Check your internet or API key'}.`);
            setIsConnected(false);
            setIsConnecting(false);
            stopSession();
          },
          onclose: (event: any) => {
            addLog(`Closed (Code: ${event.code || '?'})`);
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

  const handleFixAudio = async () => {
    if (audioStreamerRef.current) {
      try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        await audio.play();
        await audioStreamerRef.current.init();
        setAudioRoutingHelp(false);
      } catch (e) {
        console.error("Failed to fix audio routing:", e);
      }
    }
  };

  const handleTestAudio = async () => {
    if (audioStreamerRef.current) {
      // Play a short 440Hz beep via the AudioStreamer
      const sampleRate = 24000;
      const duration = 0.5;
      const floatData = new Float32Array(sampleRate * duration);
      for (let i = 0; i < floatData.length; i++) {
        floatData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.5;
      }

      const pcmArray = new Int16Array(floatData.length);
      for (let i = 0; i < floatData.length; i++) {
        const s = Math.max(-1, Math.min(1, floatData[i]));
        pcmArray[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      let binary = '';
      const bytes = new Uint8Array(pcmArray.buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = window.btoa(binary);
      await audioStreamerRef.current.playAudioChunk(base64);
    }
  };

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
    // Show routing help after a delay if connected but possibly silent
    setTimeout(() => setAudioRoutingHelp(true), 10000);
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
          <div className="flex flex-col items-center gap-2">
            <p className="text-[#6cb2ff] font-medium text-sm">
              {isConnected ? "Live Voice Mode" : "Setting up your voice classroom..."}
            </p>
            {!isConnected && !isConnecting && (
              <button
                onClick={() => { setError(null); startSession(); }}
                className="mt-2 px-4 py-1.5 bg-[#6cb2ff]/20 text-[#6cb2ff] rounded-full text-xs font-bold hover:bg-[#6cb2ff]/30 transition-all flex items-center gap-2"
              >
                <Loader2 className="w-3 h-3" />
                <span>Retry Connection</span>
              </button>
            )}
          </div>
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

        {isConnected && audioRoutingHelp && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex flex-col gap-2 text-[#6cb2ff] text-xs text-left"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 shrink-0" />
              <p className="font-bold">Audio coming from earpiece?</p>
            </div>
            <p className="opacity-80">If the sound is low or coming from the top of the phone, click the button below to fix it.</p>
            <div className="flex gap-2">
              <button
                onClick={handleFixAudio}
                className="mt-1 py-2 px-4 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors font-bold uppercase tracking-wider"
              >
                Fix Audio
              </button>
              <button
                onClick={handleTestAudio}
                className="mt-1 py-2 px-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors font-bold uppercase tracking-wider border border-white/10"
              >
                Test Sound
              </button>
            </div>
          </motion.div>
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

        {/* Technical Logs Toggle */}
        <div className="pt-4 border-t border-white/5">
          <button
            onClick={() => setShowTechnicalLogs(!showTechnicalLogs)}
            className="text-[10px] text-gray-600 hover:text-gray-400 uppercase tracking-[2px] font-bold transition-colors"
          >
            {showTechnicalLogs ? "Hide technical logs" : "Show technical logs"}
          </button>

          <AnimatePresence>
            {showTechnicalLogs && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 bg-black/40 rounded-xl p-3 text-[10px] text-left font-mono text-gray-500 max-h-32 overflow-y-auto space-y-1 border border-white/5"
              >
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="opacity-30">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                    <span>{log}</span>
                  </div>
                )) : (
                  <div className="italic opacity-30 text-center py-2">No logs yet...</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
