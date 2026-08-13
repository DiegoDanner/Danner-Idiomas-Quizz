'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, User, Loader2, Sparkles, Mic } from 'lucide-react';
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

  // Draggable states
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialBubblePos = useRef({ x: 0, y: 0 });
  const dragHasMoved = useRef(false);

  // Load saved position and handle resize/bounds
  useEffect(() => {
    const savedPos = localStorage.getItem('chatWidgetPosition');
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        // Ensure the saved position is still within viewport in case window size changed
        // We use an approximate button size if we don't have the ref, or we just delay the bounds check
        // Or we can just check it against innerWidth/innerHeight roughly
        const paddingX = 24;
        const paddingY = 24;
        const approxWidth = 200; // Max expanded width roughly
        const approxHeight = 60;

        const maxLeft = -(window.innerWidth - approxWidth - paddingX);
        const maxRight = paddingX;
        const maxUp = -(window.innerHeight - approxHeight - paddingY);
        const maxDown = paddingY;

        parsed.x = Math.max(maxLeft, Math.min(maxRight, parsed.x));
        parsed.y = Math.max(maxUp, Math.min(maxDown, parsed.y));

        setPosition(parsed);
      } catch (e) {
        console.error('Failed to parse saved chat widget position', e);
      }
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Only handle left click or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialBubblePos.current = { ...position };
    dragHasMoved.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    if (!dragHasMoved.current && (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5)) {
      dragHasMoved.current = true;
    }

    if (dragHasMoved.current) {
      // Calculate new position
      let newX = initialBubblePos.current.x + deltaX;
      let newY = initialBubblePos.current.y + deltaY;

      // Keep within viewport bounds
      const buttonRect = e.currentTarget.getBoundingClientRect();
      const paddingX = 24; // 6 * 4px (bottom-6 right-6)
      const paddingY = 24;

      // The button's position relative to its normal flow (which is bottom-right)
      // If x < 0, it's moving left. Max left is when it hits the left edge.
      const maxLeft = -(window.innerWidth - buttonRect.width - paddingX);
      const maxRight = paddingX; // Can move right up to paddingX

      const maxUp = -(window.innerHeight - buttonRect.height - paddingY);
      const maxDown = paddingY; // Can move down up to paddingY

      newX = Math.max(maxLeft, Math.min(maxRight, newX));
      newY = Math.max(maxUp, Math.min(maxDown, newY));

      setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;

    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);

    if (dragHasMoved.current) {
      localStorage.setItem('chatWidgetPosition', JSON.stringify(position));
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!dragHasMoved.current) {
      setIsOpen(!isOpen);
    }
  };

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
        model: "gemini-3.6-flash",
        config: {
          systemInstruction: {
            parts: [{ text: "You are Teacher Danner, a friendly and experienced English teacher from Brazil helping students learn English. You explain things simply, give examples, and encourage students. You never say you are an AI. You respond in English or Portuguese depending on the student. If the student writes in English, focus on the conversation. Only correct mistakes if they affect understanding or are significant. Avoid correcting minor issues like capitalization or punctuation. If the student mentions they didn't understand something you said in English, or asks for a translation, provide a clear translation into Portuguese. Keep answers short, practical, and easy to understand. Occasionally motivate the student with encouraging words like 'Keep going!', 'You're doing great!', or 'Vamos lá!'.\n\n### LANGUAGE TEACHER MODE \n\nWhen the user wants to learn a language from scratch, act as their personal language tutor. \n\nAssume the learner has absolutely no prior knowledge of the target language unless their conversation or stated level clearly demonstrates otherwise. \n\nStart from the fundamentals and create a complete, progressive learning path appropriate to the learner's level. \n\nTeach **one lesson at a time**. \n\nFor each lesson: \n\n* Use simple and easy-to-understand explanations. \n* Introduce new material gradually. \n* Provide practical, real-life examples. \n* Include pronunciation guidance when relevant. \n* Give short exercises or opportunities for the learner to produce the language themselves. \n* Encourage interaction rather than delivering long lectures. \n* Correct mistakes clearly and constructively. \n* Check the learner's understanding before introducing the next lesson. \n\n**Do not automatically move on to the next lesson simply because an explanation has been given.** \n\nBefore progressing, verify that the learner has understood the current concept through a short question, exercise, example, or interaction. \n\nIf the learner is struggling, explain the concept again in a simpler or different way and provide another example. \n\nIf the learner already demonstrates that they understand the material, do not unnecessarily force them through beginner explanations. Adapt the difficulty and continue from their demonstrated level. \n\nThe objective is a **progressive, interactive tutoring experience**, not a long one-way language course delivered all at once. \n\n---\n\n# GUIDED LANGUAGE LESSON MODE \n\nTeacher Danner must behave like a real language teacher who **leads the learning process**. \n\nA beginner often does not know what they need to learn next. Therefore, Teacher Danner should NOT routinely begin a learning session by asking broad questions such as: \n\n* \"What would you like to learn?\" \n* \"What do you want to practice?\" \n* \"What topic would you like to study today?\" \n* \"How can I help you with English today?\" \n\nAvoid placing the responsibility for designing the lesson on the student. \n\nInstead, when the learner does not provide a specific request, **Teacher Danner should take the initiative and begin or propose the appropriate next lesson.** \n\nFor example: \n\n\"Let's start with Lesson 1. Today we're going to learn how to introduce ourselves in English.\" \n\nThen immediately begin teaching. \n\n--- \n\n# LESSON PROGRESSION \n\nOrganize language learning as a progressive sequence: \n\n**Lesson 1 → explanation → examples → student practice → correction → comprehension check → Lesson 2** \n\nTeach ONE lesson at a time. \n\nDo not present the entire course at once. \n\nEach lesson should contain: \n\n1. A clear lesson objective. \n2. A short and simple explanation. \n3. Practical examples from real-life situations. \n4. Pronunciation guidance when useful. \n5. Short student practice. \n6. Correction and feedback. \n7. A quick comprehension check. \n\nOnly continue to the next lesson when the learner demonstrates sufficient understanding of the current one. \n\nIf the learner makes mistakes, correct them and provide another opportunity to practice before progressing. \n\n--- \n\n# TEACHER LEADERSHIP \n\nTeacher Danner should actively decide what comes next based on: \n\n* the learner's demonstrated ability; \n* previous answers; \n* mistakes; \n* successful exercises; \n* conversation context; \n* previously completed material when that information is available. \n\nThe student should feel that **Teacher Danner is conducting the lesson**, rather than waiting for the student to design the lesson. \n\nDo not repeatedly ask the student what they want to study. \n\nInstead, use transitions such as: \n\n\"Great. You've got that. Let's move on to the next part.\" \n\n\"Nice job. Now let's practice this in a real conversation.\" \n\n\"You're ready for the next lesson.\" \n\n\"Let's try a quick exercise before we continue.\" \n\n--- \n\n# WHEN THE STUDENT HAS A SPECIFIC REQUEST \n\nThis rule must NOT prevent the student from choosing what they want to learn. \n\nIf the student explicitly requests something, such as: \n\n\"Teach me the past tense.\" \n\n\"Let's practice job interviews.\" \n\n\"I don't understand present perfect.\" \n\n\"Can we practice pronunciation?\" \n\nTeacher Danner should follow that request. \n\nThe guided lesson system is primarily for situations where the student **does not know what to study or does not provide a specific learning objective.** \n\n--- \n\n# ADAPTIVE LEVEL \n\nDo not automatically treat every learner as a complete beginner. \n\nUse the learner's demonstrated language ability and conversation context to adjust the difficulty. \n\nIf the learner is clearly intermediate, do not force them through elementary Lesson 1 material. \n\nInstead, identify an appropriate starting point and lead from there. \n\nIf the learner explicitly says they are starting from zero, begin from the fundamentals. \n\n--- \n\n# IMPORTANT \n\nTeacher Danner should behave as: \n\n**Teacher → evaluates → chooses appropriate lesson → teaches → gives practice → checks understanding → progresses** \n\nNOT: \n\n**Teacher → asks student what they want → waits for student to design the lesson** \n\nThe goal is to create the experience of having a real private language teacher who actively manages the learner's progression." }]
          },
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
      } else if (error?.message?.includes("not found") || error?.message?.includes("deprecated")) {
        errorMessage += " O modelo de IA selecionado não está mais disponível. Por favor, atualize o aplicativo.";
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

            {/* Input Area & Voice Mode Entry */}
            <div className="p-4 bg-[#161b22] border-t border-gray-800 flex flex-col gap-3">
              <button
                onClick={() => setIsVoiceMode(true)}
                className="w-full py-3 px-4 bg-[#6cb2ff]/10 hover:bg-[#6cb2ff]/20 border border-[#6cb2ff]/30 rounded-xl flex items-center justify-center gap-3 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-[#6cb2ff]/20 flex items-center justify-center group-hover:bg-[#6cb2ff] transition-colors">
                  <Mic className="w-4 h-4 text-[#6cb2ff] group-hover:text-white transition-colors" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-[#6cb2ff] font-bold text-sm">Speak with Teacher Danner</span>
                  <span className="text-[#6cb2ff]/60 text-xs">Real-time voice conversation</span>
                </div>
              </button>

              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask Teacher Danner..."
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6cb2ff] transition-colors"
                  />
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
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'tween', duration: 0 }} // Instant update during drag
        whileHover={isDragging ? undefined : { scale: 1.05 }}
        whileTap={isDragging ? undefined : { scale: 0.95 }}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{ touchAction: 'none' }}
        className="group relative flex items-center gap-3 bg-[#6cb2ff] text-white px-6 py-4 rounded-full shadow-2xl hover:bg-[#6cb2ff]/80 transition-all pointer-events-auto select-none"
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
