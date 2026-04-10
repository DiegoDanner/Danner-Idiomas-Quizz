'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Mic, MicOff, Check, X, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Phrase } from '@/lib/doctor-phrases-data';

interface FlashcardProps {
  phrase: Phrase;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
  isCompleted: boolean;
  onComplete: () => void;
}

export default function Flashcard({ phrase, onNext, onPrevious, isFirst, isLast, isCompleted, onComplete }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState('');
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [hasUserSpoken, setHasUserSpoken] = useState(false);
  const processedBlobRef = useRef<Blob | null>(null);
  const { isRecording, audioBlob, startRecording, stopRecording, setAudioBlob, prepareStream } = useAudioRecorder();

  // Pre-warm microphone on mount
  useEffect(() => {
    prepareStream();
  }, [prepareStream]);

  // Reset state when phrase changes
  useEffect(() => {
    setIsFlipped(false);
    setTranscription('');
    setVoiceFeedback('');
    setFeedback(null);
    setHasUserSpoken(false);
    processedBlobRef.current = null;
    setAudioBlob(null);
  }, [phrase.id, setAudioBlob]);

  const getGemini = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("NEXT_PUBLIC_GEMINI_API_KEY is not defined.");
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }, []);

  const playTTS = async () => {
    if (isSpeaking) return;
    const ai = getGemini();
    if (!ai) return;

    setIsSpeaking(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: `Say clearly: ${phrase.english}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const int16Buffer = new Int16Array(bytes.buffer);
        const float32Buffer = new Float32Array(int16Buffer.length);
        for (let i = 0; i < int16Buffer.length; i++) {
          float32Buffer[i] = int16Buffer[i] / 32768;
        }

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = audioContext.createBuffer(1, float32Buffer.length, 24000);
        audioBuffer.getChannelData(0).set(float32Buffer);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
    }
  };

  const transcribeAudio = useCallback(async (blob: Blob) => {
    if (isRecording || processedBlobRef.current === blob) return;
    processedBlobRef.current = blob;

    const ai = getGemini();
    if (!ai) return;

    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are an English pronunciation coach.
                  Listen to the audio and compare it to the target phrase: "${phrase.english}".

                  Evaluate if the user said the phrase correctly.
                  CRITICAL: If the audio is silent or contains no recognizable speech, return isMatch: false and transcription: "".

                  Return a JSON object with these fields:
                  - "transcription": The exact words you heard (empty string if nothing heard).
                  - "isMatch": Boolean, true ONLY if the user spoke and matched the phrase.
                  - "feedback": A very short, encouraging tip in English if they missed something (max 10 words).

                  Return ONLY the JSON object.`
                },
                { inlineData: { mimeType: blob.type, data: base64Data } }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
          }
        });

        try {
          const result = JSON.parse(response.text || '{}');
          const capturedText = (result.transcription || '').trim();

          setTranscription(capturedText);
          setVoiceFeedback(result.feedback || '');

          if (capturedText !== "" && result.isMatch === true && !isRecording && hasUserSpoken) {
            setFeedback('success');
            onComplete();
            setTimeout(() => setIsFlipped(true), 1500);
          } else {
            setFeedback('error');
          }
        } catch (e) {
          console.error('JSON Parse Error:', e);
          setFeedback('error');
        }
        setIsTranscribing(false);
      };
    } catch (error) {
      console.error('STT Error:', error);
      setIsTranscribing(false);
    }
  }, [phrase.english, isRecording, getGemini, onComplete, hasUserSpoken]);

  useEffect(() => {
    if (audioBlob && audioBlob.size > 0 && !isRecording) {
      transcribeAudio(audioBlob);
    }
  }, [audioBlob, transcribeAudio, isRecording]);

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <div className="relative h-[400px] w-full transition-all duration-500 preserve-3d">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ rotateY: -180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 180, opacity: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute inset-0 w-full h-full bg-gray-50 dark:bg-[#121a28] rounded-[2.5rem] shadow-2xl border border-gray-200 dark:border-[#424855]/10 p-10 flex flex-col items-center justify-between overflow-hidden backface-hidden"
            >
              <div className="w-full flex justify-between items-center">
                <span className="text-[10px] font-mono text-gray-500 dark:text-[#a5abbb] uppercase tracking-[0.2em] font-bold">Medical English</span>
                <button
                  onClick={playTTS}
                  disabled={isSpeaking}
                  className={`p-3 rounded-2xl transition-all duration-300 ${isSpeaking ? 'bg-gray-100 dark:bg-[#1d2636] text-gray-400' : 'bg-gray-100 dark:bg-[#1d2636] text-[#6cb2ff] hover:bg-white dark:hover:bg-[#252f3f] hover:scale-110'}`}
                >
                  <Volume2 size={24} className={isSpeaking ? 'animate-pulse' : ''} />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 w-full">
                <h2 className="text-3xl md:text-4xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc] leading-[1.1] tracking-tight">
                  {phrase.english}
                </h2>

                <div className="h-16 flex flex-col items-center justify-center w-full">
                  {isTranscribing ? (
                    <div className="flex space-x-2">
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2.5 h-2.5 bg-[#6cb2ff] rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2.5 h-2.5 bg-[#6cb2ff] rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2.5 h-2.5 bg-[#6cb2ff] rounded-full" />
                    </div>
                  ) : transcription ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center space-y-2"
                    >
                      <div className={`flex items-center space-x-3 px-6 py-2 rounded-2xl text-sm font-medium backdrop-blur-md ${feedback === 'success' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
                        {feedback === 'success' ? <Check size={16} /> : <X size={16} />}
                        <span className="italic">&quot;{transcription}&quot;</span>
                      </div>
                      {voiceFeedback && feedback === 'error' && (
                        <p className="text-[10px] text-gray-500 dark:text-[#a5abbb] font-medium italic">{voiceFeedback}</p>
                      )}
                    </motion.div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-[#a5abbb] font-medium tracking-wide">Read aloud to unlock translation</p>
                  )}
                </div>
              </div>

              <div className="w-full flex flex-col items-center space-y-6">
                {isCompleted && !isRecording && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={onNext}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-green-500/20 transition-all"
                  >
                    <span>Proceed to Next</span>
                    <ChevronRight size={16} />
                  </motion.button>
                )}
                <button
                  onMouseDown={(e) => { e.preventDefault(); setHasUserSpoken(true); startRecording(); }}
                  onMouseUp={(e) => { e.preventDefault(); stopRecording(); }}
                  onMouseLeave={(e) => { e.preventDefault(); stopRecording(); }}
                  onTouchStart={(e) => { e.preventDefault(); setHasUserSpoken(true); startRecording(); }}
                  onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                  onTouchCancel={(e) => { e.preventDefault(); stopRecording(); }}
                  className={`relative w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 ${
                    isRecording
                      ? 'bg-red-500 scale-110 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                      : 'bg-[#6cb2ff] hover:bg-[#58a2f0] shadow-[0_0_20px_rgba(108,178,255,0.3)] hover:scale-105'
                  }`}
                >
                  {isRecording ? <MicOff size={28} className="text-white" /> : <Mic size={28} className="text-[#002442]" />}
                  {isRecording && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="absolute inset-0 bg-red-500 rounded-[2rem]"
                    />
                  )}
                </button>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 dark:text-[#a5abbb] font-black">
                  {isRecording ? 'Listening...' : 'Hold to speak'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -180, opacity: 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
              className="absolute inset-0 w-full h-full bg-gray-50 dark:bg-[#121a28] rounded-[2.5rem] shadow-2xl border border-[#6cb2ff]/20 p-10 flex flex-col items-center justify-between overflow-hidden backface-hidden"
            >
              <div className="w-full flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#6cb2ff] uppercase tracking-[0.2em] font-bold">Translation</span>
                <button
                  onClick={() => setIsFlipped(false)}
                  className="p-3 rounded-2xl bg-gray-100 dark:bg-[#1d2636] text-[#6cb2ff] hover:bg-white dark:hover:bg-[#252f3f] transition-all hover:rotate-180 duration-500"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
                <h2 className="text-3xl md:text-4xl font-headline font-bold leading-[1.1] tracking-tight text-[#6cb2ff]">
                  {phrase.portuguese}
                </h2>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-10 flex items-center space-x-3 text-green-600 dark:text-green-400/80 text-sm font-bold uppercase tracking-widest"
                >
                  <div className="w-8 h-[1px] bg-green-600/30 dark:bg-green-400/30" />
                  <span>Unlocked</span>
                  <div className="w-8 h-[1px] bg-green-600/30 dark:bg-green-400/30" />
                </motion.div>
              </div>

              <div className="w-full flex justify-between items-center pt-6">
                <button
                  onClick={onPrevious}
                  disabled={isFirst}
                  className={`flex items-center space-x-3 text-sm font-bold uppercase tracking-widest transition-all ${isFirst ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-500 dark:text-[#a5abbb] hover:text-[#6cb2ff]'}`}
                >
                  <ChevronLeft size={24} />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <button
                  onClick={onNext}
                  disabled={isLast}
                  className={`flex items-center space-x-3 text-sm font-bold uppercase tracking-widest transition-all ${isLast ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'text-gray-500 dark:text-[#a5abbb] hover:text-[#6cb2ff]'}`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
