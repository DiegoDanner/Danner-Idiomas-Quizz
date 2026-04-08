'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User, Bot, Loader2, Sparkles, Mic } from 'lucide-react';
import Image from 'next/image';
import LiveVoiceMode from './LiveVoiceMode';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Check if API key is selected (required for some models/regions)
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
          // After opening, we assume success as per guidelines
        }
      }

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
      
      if (!apiKey) {
        throw new Error("API Key not configured. Please check your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are Teacher Danner, a friendly and experienced English teacher from Brazil helping students learn English. You explain things simply, give examples, and encourage students. You never say you are an AI. You respond in English or Portuguese depending on the student. If the student writes in English, lightly and gently correct any mistakes before answering their question. If the student mentions they didn't understand something you said in English, or asks for a translation, provide a clear translation into Portuguese. Keep answers short, practical, and easy to understand. Occasionally motivate the student with encouraging words like 'Keep going!', 'You're doing great!', or 'Vamos lá!'.",
        },
        history: messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      });

      const result = await chat.sendMessage({ message: userMessage });
      const aiResponse = result.text || "Desculpe, tive um probleminha. Pode repetir?";
      
      setMessages(prev => [...prev, { role: 'model', content: aiResponse }]);
    } catch (error: any) {
      console.error("Chat error details:", error);
      
      let errorMessage = "Ops! Tive um problema técnico.";
      
      if (error?.message?.includes("API key not valid") || error?.message?.includes("API Key")) {
        errorMessage += " A chave da API não está configurada corretamente.";
      } else if (error?.message?.includes("quota") || error?.message?.includes("429")) {
        errorMessage += " Limite de uso atingido. Tente novamente em alguns instantes.";
      } else {
        errorMessage += ` Detalhes: ${error.message.substring(0, 100)}`;
      }

      setMessages(prev => [...prev, { role: 'model', content: errorMessage + " Vamos tentar de novo?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[90vw] sm:w-[400px] h-[500px] bg-[#0d1117] border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="p-4 bg-[#161b22] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full border-2 border-[#6cb2ff]/30 shadow-lg overflow-hidden bg-[#0d1117]">
                  <Image
                    src="/teacher-danner.png"
                    alt="Teacher Danner avatar"
                    fill
                    className="object-cover"
                    sizes="40px"
                    priority
                  />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">Teacher Danner</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-green-500/80">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Voice Mode Overlay */}
            <AnimatePresence>
              {isVoiceMode && (
                <LiveVoiceMode onClose={() => setIsVoiceMode(false)} />
              )}
            </AnimatePresence>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-800"
            >
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-[#6cb2ff]/10 rounded-2xl flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-[#6cb2ff]" />
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <p className="text-white font-bold text-lg">Hello! I&apos;m Teacher Danner.</p>
                      <p className="text-[#6cb2ff] font-medium text-sm">Olá! Eu sou o Professor Danner.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm px-8">
                        How can I help you with your English today? Grammar, vocabulary, or quiz questions?
                      </p>
                      <p className="text-gray-500 text-xs px-8 italic">
                        Como posso te ajudar com seu inglês hoje? Gramática, vocabulário ou dúvidas dos quizzes?
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center overflow-hidden border border-gray-800 ${
                      msg.role === 'user' ? 'bg-blue-500/20' : 'bg-[#0d1117]'
                    }`}>
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4 text-blue-500" />
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src="/teacher-danner.png"
                            alt="Teacher Danner"
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      )}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-[#161b22] text-gray-200 border border-gray-800 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-center bg-[#161b22] border border-gray-800 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 className="w-4 h-4 text-[#6cb2ff] animate-spin" />
                    <span className="text-xs text-gray-400">Teacher Danner is typing...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-[#161b22] border-t border-gray-800">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Teacher Danner..."
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#6cb2ff] transition-colors"
                  />
                  <button
                    onClick={() => setIsVoiceMode(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#6cb2ff] transition-colors"
                    title="Voice Mode"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-[#6cb2ff] text-white rounded-xl hover:bg-[#6cb2ff]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 bg-[#6cb2ff] text-white px-6 py-4 rounded-full shadow-2xl hover:bg-[#6cb2ff]/80 transition-all pointer-events-auto"
      >
        <span className="font-bold whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[200px] transition-all duration-500 ease-in-out">
          Talk to Teacher Danner
        </span>
        <div className="relative flex items-center gap-2">
          {isOpen ? <X className="w-6 h-6" /> : (
            <>
              <Mic className="w-4 h-4 text-white/50" />
              <MessageCircle className="w-6 h-6" />
            </>
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#6cb2ff] rounded-full" />
          )}
        </div>
      </motion.button>
    </div>
  );
}
