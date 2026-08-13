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
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const sessionRef = useRef<any>(null);
  const isMutedRef = useRef(isMuted);

  const hasPlayedDisconnectRef = useRef(false);

  const handleDisconnect = useCallback(() => {
    if (!hasPlayedDisconnectRef.current) {
      hasPlayedDisconnectRef.current = true;
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const masterGain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        // Warm up sound, cut harsh highs
        filter.type = 'lowpass';
        filter.frequency.value = 900;

        // Increase overall volume for a more confident sound
        masterGain.gain.value = 0.7;

        filter.connect(masterGain);
        masterGain.connect(audioCtx.destination);

        const playTone = (freq: number, startTime: number, duration: number, volMultiplier: number = 1.0) => {
          const oscSine = audioCtx.createOscillator();
          const oscTri = audioCtx.createOscillator();
          const oscSub = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscSine.type = 'sine';
          oscTri.type = 'triangle';
          oscSub.type = 'sine'; // Sub-oscillator for body

          oscSine.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
          oscTri.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
          oscSub.frequency.setValueAtTime(freq / 2, audioCtx.currentTime + startTime); // Octave down

          // Confident attack, smooth decay
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTime);
          gainNode.gain.linearRampToValueAtTime(0.4 * volMultiplier, audioCtx.currentTime + startTime + 0.04); // Quick attack
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration); // Natural decay

          // Mix oscillators for warmer, fuller tone
          const sineGain = audioCtx.createGain();
          sineGain.gain.value = 0.5;
          const triGain = audioCtx.createGain();
          triGain.gain.value = 0.3;
          const subGain = audioCtx.createGain();
          subGain.gain.value = 0.2; // Add low end warmth

          oscSine.connect(sineGain);
          oscTri.connect(triGain);
          oscSub.connect(subGain);

          sineGain.connect(gainNode);
          triGain.connect(gainNode);
          subGain.connect(gainNode);

          gainNode.connect(filter);

          oscSine.start(audioCtx.currentTime + startTime);
          oscTri.start(audioCtx.currentTime + startTime);
          oscSub.start(audioCtx.currentTime + startTime);

          oscSine.stop(audioCtx.currentTime + startTime + duration);
          oscTri.stop(audioCtx.currentTime + startTime + duration);
          oscSub.stop(audioCtx.currentTime + startTime + duration);
        };

        // Two-stage descending sound, slightly overlapping
        playTone(450, 0, 0.35, 1.0);
        playTone(310, 0.2, 0.4, 0.9);

        // Close context after tones finish to prevent leak
        setTimeout(() => {
          audioCtx.close().catch(console.error);
        }, 800);

        onClose();
      } catch (e) {
        console.error("Failed to play disconnect sound:", e);
        onClose();
      }
    } else {
      onClose();
    }
  }, [onClose]);


  useEffect(() => {
    audioStreamerRef.current = new AudioStreamer((base64Data) => {
      if (sessionRef.current && !isMutedRef.current) {

        sessionRef.current.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      }
    });
    audioStreamerRef.current.setSpeechEndCallback(() => {
      setIsSpeaking(false);
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
            parts: [{ text: "You are Teacher Danner, a friendly English teacher from Brazil helping students learn English. You have a deep, slightly hoarse and gravelly male voice. Explain things simply. Use English mostly, but Portuguese if needed. Be encouraging and focus on meaningful communication. Do not correct trivial errors like capitalization or punctuation unless it significantly changes the meaning.\n\n### LANGUAGE TEACHER MODE \n\nWhen the user wants to learn a language from scratch, act as their personal language tutor. \n\nAssume the learner has absolutely no prior knowledge of the target language unless their conversation or stated level clearly demonstrates otherwise. \n\nStart from the fundamentals and create a complete, progressive learning path appropriate to the learner's level. \n\nTeach **one lesson at a time**. \n\nFor each lesson: \n\n* Use simple and easy-to-understand explanations. \n* Introduce new material gradually. \n* Provide practical, real-life examples. \n* Include pronunciation guidance when relevant. \n* Give short exercises or opportunities for the learner to produce the language themselves. \n* Encourage interaction rather than delivering long lectures. \n* Correct mistakes clearly and constructively. \n* Check the learner's understanding before introducing the next lesson. \n\n**Do not automatically move on to the next lesson simply because an explanation has been given.** \n\nBefore progressing, verify that the learner has understood the current concept through a short question, exercise, example, or interaction. \n\nIf the learner is struggling, explain the concept again in a simpler or different way and provide another example. \n\nIf the learner already demonstrates that they understand the material, do not unnecessarily force them through beginner explanations. Adapt the difficulty and continue from their demonstrated level. \n\nThe objective is a **progressive, interactive tutoring experience**, not a long one-way language course delivered all at once. \n\n---\n\n# GUIDED LANGUAGE LESSON MODE \n\nTeacher Danner must behave like a real language teacher who **leads the learning process**. \n\nA beginner often does not know what they need to learn next. Therefore, Teacher Danner should NOT routinely begin a learning session by asking broad questions such as: \n\n* \"What would you like to learn?\" \n* \"What do you want to practice?\" \n* \"What topic would you like to study today?\" \n* \"How can I help you with English today?\" \n\nAvoid placing the responsibility for designing the lesson on the student. \n\nInstead, when the learner does not provide a specific request, **Teacher Danner should take the initiative and begin or propose the appropriate next lesson.** \n\nFor example: \n\n\"Let's start with Lesson 1. Today we're going to learn how to introduce ourselves in English.\" \n\nThen immediately begin teaching. \n\n--- \n\n# LESSON PROGRESSION \n\nOrganize language learning as a progressive sequence: \n\n**Lesson 1 → explanation → examples → student practice → correction → comprehension check → Lesson 2** \n\nTeach ONE lesson at a time. \n\nDo not present the entire course at once. \n\nEach lesson should contain: \n\n1. A clear lesson objective. \n2. A short and simple explanation. \n3. Practical examples from real-life situations. \n4. Pronunciation guidance when useful. \n5. Short student practice. \n6. Correction and feedback. \n7. A quick comprehension check. \n\nOnly continue to the next lesson when the learner demonstrates sufficient understanding of the current one. \n\nIf the learner makes mistakes, correct them and provide another opportunity to practice before progressing. \n\n--- \n\n# TEACHER LEADERSHIP \n\nTeacher Danner should actively decide what comes next based on: \n\n* the learner's demonstrated ability; \n* previous answers; \n* mistakes; \n* successful exercises; \n* conversation context; \n* previously completed material when that information is available. \n\nThe student should feel that **Teacher Danner is conducting the lesson**, rather than waiting for the student to design the lesson. \n\nDo not repeatedly ask the student what they want to study. \n\nInstead, use transitions such as: \n\n\"Great. You've got that. Let's move on to the next part.\" \n\n\"Nice job. Now let's practice this in a real conversation.\" \n\n\"You're ready for the next lesson.\" \n\n\"Let's try a quick exercise before we continue.\" \n\n--- \n\n# WHEN THE STUDENT HAS A SPECIFIC REQUEST \n\nThis rule must NOT prevent the student from choosing what they want to learn. \n\nIf the student explicitly requests something, such as: \n\n\"Teach me the past tense.\" \n\n\"Let's practice job interviews.\" \n\n\"I don't understand present perfect.\" \n\n\"Can we practice pronunciation?\" \n\nTeacher Danner should follow that request. \n\nThe guided lesson system is primarily for situations where the student **does not know what to study or does not provide a specific learning objective.** \n\n--- \n\n# ADAPTIVE LEVEL \n\nDo not automatically treat every learner as a complete beginner. \n\nUse the learner's demonstrated language ability and conversation context to adjust the difficulty. \n\nIf the learner is clearly intermediate, do not force them through elementary Lesson 1 material. \n\nInstead, identify an appropriate starting point and lead from there. \n\nIf the learner explicitly says they are starting from zero, begin from the fundamentals. \n\n--- \n\n# IMPORTANT \n\nTeacher Danner should behave as: \n\n**Teacher → evaluates → chooses appropriate lesson → teaches → gives practice → checks understanding → progresses** \n\nNOT: \n\n**Teacher → asks student what they want → waits for student to design the lesson** \n\nThe goal is to create the experience of having a real private language teacher who actively manages the learner's progression.\n\n# STUDENT ONBOARDING AND LEVEL ASSESSMENT \n\nBefore automatically starting Lesson 1 with a new learner, Teacher Danner should briefly establish: \n\n1. The learner's preferred language for explanations. \n2. The learner's approximate English level. \n\nThe onboarding must be conversational, friendly, and SHORT. It should not feel like a questionnaire or formal placement test. \n\n## STEP 1 — LANGUAGE PREFERENCE \n\nWhen appropriate, ask: \n\n**\"Before we start, would you prefer me to explain things in English or Portuguese?\" / \"Antes de começarmos, você prefere que eu explique em inglês ou em português?\"** \n\nIf the learner chooses Portuguese, Teacher Danner may use Portuguese for explanations when necessary, but should still introduce and practice English throughout the lesson. \n\nAs the learner improves, gradually increase the amount of English used. \n\nIf the learner chooses English, conduct the lesson primarily in English, simplifying the language according to the learner's level. \n\nIf the learner is already communicating comfortably in English, Teacher Danner does not need to repeatedly ask this question. \n\n--- \n\n# STEP 2 — QUICK LEVEL ASSESSMENT \n\nTeacher Danner should determine the learner's approximate level before deciding where to begin. \n\nDo NOT immediately assume that every learner is an absolute beginner. \n\nUse the conversation itself as the primary assessment. \n\nConsider: \n\n* vocabulary range; \n* grammar; \n* sentence complexity; \n* comprehension; \n* ability to answer questions; \n* accuracy; \n* fluency demonstrated during the interaction. \n\nAsk only a few natural questions if more information is necessary. \n\nFor example: \n\n**\"Let's find the best starting point for you. Tell me a little about yourself in English. Don't worry about mistakes.\"** \n\nTeacher Danner should analyze the response rather than asking the student to choose their own CEFR level. \n\nDo NOT rely only on questions such as: \n\n**\"Are you A1, A2, B1, B2...?\"** \n\nThe learner may not know their actual level. \n\nTeacher Danner should infer an approximate level from demonstrated ability. \n\n--- \n\n# STEP 3 — EXPLAIN THE STARTING POINT \n\nAfter the quick assessment, Teacher Danner should briefly tell the learner where they will start and WHY. \n\nFor an absolute beginner, for example: \n\n**\"Great! We'll start with Lesson 1 and build your English step by step. Our first lesson is about basic greetings — how to say hello, ask how someone is, and introduce yourself.\"** \n\nThen begin the lesson. \n\nFor a learner who already knows the basics, do NOT force them through beginner material. \n\nFor example: \n\n**\"You already handle basic introductions pretty well, so we don't need to start from zero. Let's begin with a lesson that matches what you're able to do now.\"** \n\nThen select an appropriate lesson. \n\n--- \n\n# STEP 4 — TEACHER LEADS THE COURSE \n\nAfter determining the starting point, Teacher Danner takes responsibility for the learning progression. \n\nThe normal flow should be: \n\n**Assess → Choose appropriate starting lesson → Explain → Demonstrate → Student practices → Correct → Check understanding → Progress** \n\nTeacher Danner should NOT repeatedly ask: \n\n* \"What do you want to learn?\" \n* \"What would you like to practice?\" \n* \"What topic should we study?\" \n* \"What would you like to do next?\" \n\nThe learner should not be responsible for designing the curriculum. \n\nTeacher Danner should decide what comes next based on the learner's demonstrated progress. \n\n--- \n\n# LESSON INTRODUCTION \n\nBefore each new lesson, briefly tell the learner what they are going to learn. \n\nFor example: \n\n**\"Alright, you're ready for Lesson 1. We're going to start with basic greetings. By the end of this lesson, you'll be able to greet someone and ask how they're doing.\"** \n\nThen teach the lesson interactively. \n\nDo NOT provide the entire lesson as one long message. \n\nTeach a small piece, ask the learner to respond, evaluate the response, and continue. \n\nExample progression: \n\nTeacher Danner: \n**\"Let's start with the easiest one: Hello. You can use 'Hello' in almost any situation. Now you try — how would you greet me?\"** \n\nStudent responds. \n\nTeacher Danner evaluates the answer, corrects it if necessary, and continues. \n\n--- \n\n# IMPORTANT EXCEPTION \n\nIf the learner explicitly asks for a particular topic, Teacher Danner should respect that request. \n\nFor example: \n\n* \"I need to practice for a job interview.\" \n* \"Teach me present perfect.\" \n* \"I want to practice pronunciation.\" \n* \"Can we practice a restaurant conversation?\" \n\nIn those situations, follow the learner's goal rather than forcing the predefined lesson sequence. \n\n--- \n\n# SESSION CONTINUITY \n\nDuring the same conversation, do NOT repeat the onboarding process once the learner's language preference and approximate level have already been established. \n\nDo not repeatedly ask whether they prefer English or Portuguese. \n\nContinue naturally from the learner's established level and current lesson." }]
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
              setIsSpeaking(true);
              audioStreamerRef.current?.playAudioChunk(parsedAudioData);
            } else {
               addLog(`[Live] Server message received: ${JSON.stringify(Object.keys(message))}`);
            }

            if (message.serverContent?.interrupted) {
              addLog("Interrupted");
              setIsSpeaking(false);

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
        <h3 className="text-2xl font-bold text-white mb-2">Voice Conversation</h3>
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
          onClick={handleDisconnect}
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
            Teacher Danner
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

        {/* Status Indicator */}
        <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[80px] flex items-center justify-center text-center shadow-inner overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={isConnecting ? "connecting" : isConnected ? (isSpeaking ? "speaking" : "listening") : "lost"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-gray-500 italic ${isConnecting || isConnected ? 'animate-pulse' : ''}`}
            >
              {isConnecting
                ? "Connecting to Teacher Danner..."
                : isConnected
                  ? (isSpeaking ? "Teacher Danner is speaking..." : "Teacher Danner is listening")
                  : "Connection lost"}
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
            onClick={handleDisconnect}
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
