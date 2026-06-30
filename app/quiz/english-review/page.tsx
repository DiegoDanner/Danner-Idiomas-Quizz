"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  Check,
  X,
  Volume2,
  RotateCcw,
  Home,
  Award,
  Play,
  BookOpen
} from "lucide-react";
import { quizData, QuestionData } from "@/lib/quizDataEnglishReview";
import Link from "next/link";
import { useAuth } from '@/context/AuthContext';

type QuizState = "start" | "playing" | "results";

export default function QuizApp() {
  const { user } = useAuth();
  const [quizState, setQuizState] = useState<QuizState>("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizState === "playing" && !isAnswerChecked && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (quizState === "playing" && !isAnswerChecked && timeLeft === 0) {
      setIsCorrect(false);
      setIsAnswerChecked(true);
    }
    return () => clearInterval(timer);
  }, [quizState, isAnswerChecked, timeLeft]);

  const resetQuiz = () => {
    setQuizState("playing");
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(30);
    setSelectedAnswer("");
    setIsAnswerChecked(false);
    setIsCorrect(false);
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const getFullSentence = (q: QuestionData, filledAnswer: string = "blank") => {
    if (q.type === "multiple-choice" && q.sentence) {
      return q.sentence.replace("___", filledAnswer);
    }
    return q.instruction;
  };

  const handleCheck = () => {
    if (!selectedAnswer.trim()) return;

    const q = quizData[currentQuestionIndex];
    const isAnsCorrect =
      selectedAnswer.trim().toLowerCase() === q.correctAnswer.toLowerCase();

    setIsCorrect(isAnsCorrect);
    setIsAnswerChecked(true);

    if (isAnsCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedAnswer("");
      setIsAnswerChecked(false);
      setIsCorrect(false);
      setTimeLeft(30);
    } else {
      import('@/lib/progress').then(({ saveQuizProgress }) => {
        saveQuizProgress({
          quiz_id: 'english-review',
          score: score,
          total_questions: quizData.length
        });
      });
      setQuizState("results");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!isAnswerChecked) {
        handleCheck();
      } else {
        handleNext();
      }
    }
  };

  const q = quizData[currentQuestionIndex];
  const progressPercent = (currentQuestionIndex / quizData.length) * 100;

  const shuffledOptions = useMemo(() => {
    if (!q || !q.options) return [];
    const optionsCopy = [...q.options];
    for (let i = optionsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsCopy[i], optionsCopy[j]] = [optionsCopy[j], optionsCopy[i]];
    }
    return optionsCopy;
  }, [q]);

  if (quizState === "start") {
    return (
      <div className="h-screen flex items-center justify-center p-6 font-sans bg-slate-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 md:p-16 rounded-[32px] shadow-xl shadow-slate-200/50 max-w-lg w-full text-center border border-slate-100 relative"
        >
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <BookOpen size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 leading-tight">
            English <span className="text-blue-600">Mastery</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed">
            Master your English grammar through interactive exercises.
          </p>
          <button
            onClick={() => setQuizState("playing")}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <Play fill="currentColor" size={24} />
            Start Learning
          </button>
        </motion.div>
      </div>
    );
  }

  if (quizState === "results") {
    const accuracy = Math.round((score / quizData.length) * 100);
    let performanceLevel = "Needs Practice";
    if (accuracy >= 90) performanceLevel = "Outstanding!";
    else if (accuracy >= 70) performanceLevel = "Great Job!";

    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-slate-50 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 text-center"
        >
          <div className="inline-block bg-amber-50 p-6 rounded-full mb-8">
            <Award className="w-20 h-20 text-amber-500" />
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-2">{performanceLevel}</h2>
          <p className="text-xl text-slate-500 mb-10">You&apos;ve completed the lesson.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
            <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center border border-slate-100">
              <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Score</div>
              <div className="text-4xl font-bold text-blue-600">
                {score} <span className="text-2xl text-slate-300">/ {quizData.length}</span>
              </div>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl flex flex-col items-center border border-emerald-100">
              <div className="text-emerald-600 text-sm font-bold uppercase tracking-wider mb-2">Accuracy</div>
              <div className="text-4xl font-bold text-emerald-700">{accuracy}%</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button
              onClick={resetQuiz}
              className="flex-1 flex justify-center items-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <RotateCcw size={22} />
              Try Again
            </button>
            <Link
              href="/"
              className="flex-1 flex justify-center items-center gap-2 bg-white text-slate-500 border-2 border-slate-200 px-6 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95"
            >
              <Home size={22} />
              Home
            </Link>
          </div>

          <button
            onClick={() => {
              const studentName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';
              const emailSubject = `English Review Results: ${studentName}`;

              let emailBody = `Hello Teacher,\n\nHere are the results for the English Review:\n\n`;
              emailBody += `Score: ${score} out of ${quizData.length}\n`;
              emailBody += `Accuracy: ${accuracy}%\n\n`;
              emailBody += `Performance: ${performanceLevel}\n\n`;
              emailBody += `Best regards,\n${studentName}`;

              const mailtoLink = `mailto:diegodanner@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
              window.location.href = mailtoLink;
            }}
            className="mt-6 w-full flex justify-center items-center gap-2 bg-[#6cb2ff]/10 text-[#6cb2ff] border-2 border-[#6cb2ff]/30 px-6 py-4 rounded-2xl text-lg font-bold hover:bg-[#6cb2ff]/20 transition-all active:scale-95"
          >
            Email Result to Teacher
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 font-sans flex flex-col overflow-hidden select-none" onKeyDown={handleKeyDown}>
      {/* Top Header Section */}
      <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1 w-1/3 min-w-[200px]">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question {currentQuestionIndex + 1} / {quizData.length}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round(progressPercent)}% Complete
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-blue-500 rounded-full absolute top-0 left-0"
              initial={{ width: `${progressPercent}%` }}
              animate={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl border bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-bold hidden sm:block">Menu</span>
          </Link>
          <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl border transition-colors ${
            timeLeft <= 5 ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse" : "bg-amber-50 border-amber-100 text-amber-700"
          }`}>
            <Timer className={`w-5 h-5 hidden sm:block ${timeLeft <= 5 ? "text-rose-500" : "text-amber-500"}`} />
            <span className="font-mono font-bold text-base sm:text-lg tabular-nums">
              00:{timeLeft.toString().padStart(2, "0")}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
            <Award className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-emerald-700">Score: {score}</span>
          </div>
        </div>
      </header>

      {/* Main Quiz Area */}
      <main className="flex-1 flex flex-col items-center justify-start sm:justify-center p-4 sm:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            {/* Question Card */}
            <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10 relative">
              <div className="flex items-start gap-4 mb-8">
                <button
                  onClick={() =>
                    speak(getFullSentence(q, isAnswerChecked ? q.correctAnswer : "blank"))
                  }
                  className="mt-1 p-2 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors shrink-0"
                  title="Listen"
                  tabIndex={-1}
                >
                  <Volume2 className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                  {q.instruction}
                </h2>
              </div>

              {/* Interactive Content */}
              <div className="space-y-6">
                {q.type === "multiple-choice" && (
                  <>
                    <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <p className="text-xl text-slate-700 leading-relaxed w-full whitespace-pre-wrap">
                        {q.sentence?.split("___").map((part, i, arr) => (
                          <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && (
                              <span
                                className={`inline-block min-w-[80px] border-b-2 sm:border-2 sm:border-dashed mx-1 text-center font-bold px-4 py-1 rounded-lg ${
                                  isAnswerChecked
                                    ? isCorrect
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                      : "bg-rose-50 border-rose-500 text-rose-700"
                                    : selectedAnswer
                                    ? "bg-white border-blue-400 text-blue-600 border-solid"
                                    : "border-blue-300 text-blue-600"
                                }`}
                              >
                                {isAnswerChecked
                                  ? isCorrect
                                    ? selectedAnswer
                                    : q.correctAnswer
                                  : selectedAnswer || "\u00A0"}
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>

                    {shuffledOptions.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                        {shuffledOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setSelectedAnswer(opt)}
                            disabled={isAnswerChecked}
                            className={`p-6 border-2 rounded-2xl text-left font-bold text-xl transition-all flex justify-between items-center ${
                              isAnswerChecked
                                ? opt === q.correctAnswer
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                  : opt === selectedAnswer
                                  ? "border-rose-500 bg-rose-50 text-rose-700"
                                  : "border-slate-100 bg-white text-slate-300"
                                : selectedAnswer === opt
                                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-4 ring-blue-500/20"
                                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 text-slate-700 hover:shadow-sm"
                            }`}
                          >
                            <span>{opt}</span>
                            {isAnswerChecked && opt === q.correctAnswer && (
                              <Check className="text-emerald-600" size={24} strokeWidth={3} />
                            )}
                            {isAnswerChecked && opt === selectedAnswer && opt !== q.correctAnswer && (
                              <X className="text-rose-600" size={24} strokeWidth={3} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Feedback Section */}
              <AnimatePresence>
                {isAnswerChecked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row gap-4 ${
                      isCorrect ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"
                    }`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg ${
                        isCorrect ? "bg-emerald-500 shadow-emerald-200" : "bg-rose-500 shadow-rose-200"
                      }`}>
                        {isCorrect ? <Check className="w-6 h-6" strokeWidth={3} /> : <X className="w-6 h-6" strokeWidth={3} />}
                      </div>
                      <div>
                        <h4 className={`font-bold mb-1 ${isCorrect ? "text-emerald-800" : "text-rose-800"}`}>
                          {isCorrect ? "Correto!" : "Incorreto"}
                        </h4>
                        {!isCorrect && (
                          <p className="text-rose-700 text-sm mb-3">
                            A resposta correta é <span className="font-bold underline">{q.correctAnswer}</span>. {q.explanation}
                          </p>
                        )}
                        {isCorrect && q.explanation && (
                          <p className="text-emerald-700 text-sm mb-3">
                            {q.explanation}
                          </p>
                        )}
                        <div className={`text-xs italic p-2 rounded-lg inline-block ${
                          isCorrect ? "text-emerald-600 bg-emerald-100/50" : "text-rose-600 bg-rose-100/50"
                        }`}>
                          Exemplo: &quot;{q.example}&quot;
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <footer className="bg-white border-t border-slate-200 px-6 sm:px-12 pb-24 pt-4 sm:py-6 flex flex-col-reverse sm:flex-row items-center justify-center gap-4 shrink-0 z-10">
        <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
          {!isAnswerChecked ? (
            <>
              <button
                onClick={() => {
                  setSelectedAnswer(q.correctAnswer);
                  setIsCorrect(false);
                  setIsAnswerChecked(true);
                }}
                className="px-6 py-2 text-slate-400 font-semibold hover:text-slate-600 block"
              >
                Desistir
              </button>
              <button
                onClick={handleCheck}
                disabled={!selectedAnswer.trim()}
                className={`flex-1 sm:flex-none px-12 py-4 rounded-2xl font-bold transition-all shadow-lg transform active:scale-95 ${
                  selectedAnswer.trim()
                    ? "text-white bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                    : "text-slate-400 bg-slate-100 shadow-none cursor-not-allowed active:scale-100"
                }`}
              >
                Check
              </button>
            </>
          ) : (
            <button
              onClick={handleNext}
              className={`flex-1 sm:flex-none px-12 py-4 rounded-2xl font-bold text-white shadow-lg transform transition-all active:scale-95 ${
                isCorrect
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              }`}
            >
              {currentQuestionIndex === quizData.length - 1 ? "Finish" : "Next Question"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
