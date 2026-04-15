'use client';

import { useState, use, useCallback } from 'react';
import { BookA, ArrowLeft, Play, Loader2 } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Book from '@/components/storytelling/Book';
import WordModal from '@/components/storytelling/WordModal';
import GlossaryModal from '@/components/storytelling/GlossaryModal';
import { stories } from '@/lib/stories';
import { notFound } from 'next/navigation';

export default function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const story = stories.find(s => s.id === id);

  const [activeWordId, setActiveWordId] = useState<string | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);

  const speak = useCallback(async (text: string) => {
    if (!text || isSpeaking || isLoadingTTS) return;

    setIsLoadingTTS(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
      if (!apiKey) throw new Error("API Key not configured.");

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
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
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const binaryString = window.atob(base64Audio);
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
        setIsSpeaking(true);
        source.onended = () => {
          setIsSpeaking(false);
          audioContext.close();
        };
        source.start(0);
      }
    } catch (error) {
      console.error("Error in TTS:", error);
    } finally {
      setIsLoadingTTS(false);
    }
  }, [isSpeaking, isLoadingTTS]);

  if (!story) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] dark:bg-[#080e1a] transition-colors duration-300">
      <Navbar />

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center gap-8">
        <div className="w-full flex justify-between items-center">
          <Link
            href="/storytelling"
            className="flex items-center gap-2 text-gray-600 dark:text-[#a5abbb] hover:text-[#6cb2ff] transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Library
          </Link>

          <button
            onClick={() => setIsGlossaryOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6cb2ff] text-[#002442] font-bold rounded-xl shadow-lg shadow-[#6cb2ff]/20 hover:bg-[#58a2f0] transition-all"
          >
            <BookA className="w-5 h-5" />
            Open Glossary
          </button>
        </div>

        <div className="text-center space-y-2 mb-4 flex flex-col items-center">
          <button
            onClick={() => speak(currentText)}
            disabled={!currentText || isLoadingTTS || isSpeaking}
            className="mb-12 flex items-center gap-2 px-10 py-3 bg-white text-gray-600 border border-gray-100 rounded-full shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {isLoadingTTS ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
            )}
            <span className="font-medium">Read to me</span>
          </button>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-[#e5ebfc] font-headline">
            {story.title}
          </h1>
          <p className="text-gray-500 dark:text-[#a5abbb]">By {story.author}</p>
        </div>

        <Book
          pages={story.pages}
          title={story.title}
          onWordClick={setActiveWordId}
          glossary={story.glossary}
          onTextChange={setCurrentText}
        />

        <WordModal
          wordId={activeWordId}
          onClose={() => setActiveWordId(null)}
          glossary={story.glossary}
        />

        <GlossaryModal
          isOpen={isGlossaryOpen}
          onClose={() => setIsGlossaryOpen(false)}
          onWordClick={setActiveWordId}
          glossary={story.glossary}
        />
      </main>
    </div>
  );
}
