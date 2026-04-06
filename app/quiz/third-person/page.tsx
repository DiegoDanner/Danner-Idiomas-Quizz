'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, RotateCcw, ArrowRight, Mic, Volume2, Info, XCircle, Play } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuthAction } from '@/hooks/useAuthAction';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { saveQuizProgress } from '@/lib/progress';
import { GoogleGenAI, Modality } from "@google/genai";

interface Question {
  sentence: string;
  verb: string;
  options: string[];
  answer: string;
  rule: string;
  translation: string;
}

const QUESTIONS: Question[] = [
  { sentence: 'She ___ to the library every week.', verb: 'go', options: ['go', 'goes', 'going'], answer: 'goes', rule: 'Verbs ending in -o: add "-es"', translation: 'Ela vai para a biblioteca toda semana.' },
  { sentence: 'He ___ his car on Sundays.', verb: 'wash', options: ['washes', 'washs', 'wash'], answer: 'washes', rule: 'Verbs ending in -sh: add "-es"', translation: 'Ele lava o carro dele aos domingos.' },
  { sentence: 'The teacher ___ the old classroom.', verb: 'miss', options: ['miss', 'mises', 'misses'], answer: 'misses', rule: 'Verbs ending in -ss: add "-es"', translation: 'O professor sente falta da antiga sala de aula.' },
  { sentence: 'My dad ___ the TV in the evening.', verb: 'watch', options: ['watch', 'watches', 'watchs'], answer: 'watches', rule: 'Verbs ending in -ch: add "-es"', translation: 'Meu pai assiste à TV à noite.' },
  { sentence: 'He ___ broken toys.', verb: 'fix', options: ['fixs', 'fix', 'fixes'], answer: 'fixes', rule: 'Verbs ending in -x: add "-es"', translation: 'Ele conserta brinquedos quebrados.' },
  { sentence: 'The baby ___ when he is hungry.', verb: 'cry', options: ['cries', 'crys', 'cry'], answer: 'cries', rule: 'Consonant + y: change "y" to "-ies"', translation: 'O bebê chora quando está com fome.' },
  { sentence: 'She ___ very hard for her exams.', verb: 'study', options: ['studys', 'studies', 'study'], answer: 'studies', rule: 'Consonant + y: change "y" to "-ies"', translation: 'Ela estuda muito para suas provas.' },
  { sentence: 'A pilot ___ airplanes.', verb: 'fly', options: ['flyes', 'fly', 'flies'], answer: 'flies', rule: 'Consonant + y: change "y" to "-ies"', translation: 'Um piloto pilota aviões.' },
  { sentence: 'He ___ to be the best.', verb: 'try', options: ['tries', 'trys', 'try'], answer: 'tries', rule: 'Consonant + y: change "y" to "-ies"', translation: 'Ele tenta ser o melhor.' },
  { sentence: 'She ___ a beautiful dog.', verb: 'have', options: ['have', 'has', 'haves'], answer: 'has', rule: 'Exception for the verb "to have"', translation: 'Ela tem um cachorro bonito.' },
  { sentence: 'My brother ___ in a big company.', verb: 'work', options: ['workes', 'work', 'works'], answer: 'works', rule: 'General rule: add "-s"', translation: 'Meu irmão trabalha em uma grande empresa.' },
  { sentence: 'The sun ___ in the east.', verb: 'rise', options: ['rises', 'rising', 'rise'], answer: 'rises', rule: 'General rule: add "-s"', translation: 'O sol nasce no leste.' },
  { sentence: 'She always ___ delicious cakes.', verb: 'make', options: ['makes', 'make', 'making'], answer: 'makes', rule: 'General rule: add "-s"', translation: 'Ela sempre faz bolos deliciosos.' },
  { sentence: 'It ___ a lot in winter here.', verb: 'rain', options: ['rain', 'raining', 'rains'], answer: 'rains', rule: 'General rule: add "-s"', translation: 'Chove muito no inverno aqui.' },
  { sentence: 'He ___ his homework after school.', verb: 'do', options: ['does', 'do', 'doing'], answer: 'does', rule: 'Verbs ending in -o: add "-es"', translation: 'Ele faz sua lição de casa depois da escola.' },
  { sentence: 'The cat ___ on the sofa all day.', verb: 'sleep', options: ['sleep', 'sleeps', 'sleeping'], answer: 'sleeps', rule: 'General rule: add "-s"', translation: 'O gato dorme no sofá o dia todo.' },
  { sentence: 'She ___ her friends every weekend.', verb: 'meet', options: ['meeting', 'meets', 'meet'], answer: 'meets', rule: 'General rule: add "-s"', translation: 'Ela encontra seus amigos todo fim de semana.' },
  { sentence: 'He ___ the piano beautifully.', verb: 'play', options: ['plays', 'playes', 'play'], answer: 'plays', rule: 'General rule: add "-s"', translation: 'Ele toca piano lindamente.' },
  { sentence: 'A chef ___ food in a restaurant.', verb: 'cook', options: ['cooking', 'cook', 'cooks'], answer: 'cooks', rule: 'General rule: add "-s"', translation: 'Um chef cozinha comida em um restaurante.' },
  { sentence: 'She ___ beautiful songs.', verb: 'sing', options: ['sings', 'sing', 'singing'], answer: 'sings', rule: 'General rule: add "-s"', translation: 'Ela canta belas canções.' },
  { sentence: 'The train ___ at 8 AM.', verb: 'leave', options: ['leave', 'leaves', 'leaving'], answer: 'leaves', rule: 'General rule: add "-s"', translation: 'O trem parte às 8h.' },
  { sentence: 'My mom ___ the best cookies.', verb: 'bake', options: ['bakes', 'bake', 'baking'], answer: 'bakes', rule: 'General rule: add "-s"', translation: 'Minha mãe assa os melhores cookies.' },
  { sentence: 'He often ___ about his adventures.', verb: 'talk', options: ['talks', 'talk', 'talking'], answer: 'talks', rule: 'General rule: add "-s"', translation: 'Ele frequentemente fala sobre suas aventuras.' },
  { sentence: 'She ___ her hair every morning.', verb: 'brush', options: ['brushs', 'brushes', 'brush'], answer: 'brushes', rule: 'Verbs ending in -sh: add "-es"', translation: 'Ela escova o cabelo toda manhã.' },
  { sentence: 'A good student ___ for answers.', verb: 'search', options: ['searchs', 'search', 'searches'], answer: 'searches', rule: 'Verbs ending in -ch: add "-es"', translation: 'Um bom aluno procura por respostas.' },
  { sentence: 'He ___ different ingredients for the recipe.', verb: 'mix', options: ['mixes', 'mixs', 'mix'], answer: 'mixes', rule: 'Verbs ending in -x: add "-es"', translation: 'Ele mistura diferentes ingredientes para a receita.' },
  { sentence: 'She ___ the heavy bag with difficulty.', verb: 'carry', options: ['carrys', 'carries', 'carry'], answer: 'carries', rule: 'Consonant + y: change "y" to "-ies"', translation: 'Ela carrega a bolsa pesada com dificuldade.' },
  { sentence: 'He ___ that he will be late.', verb: 'worry', options: ['worrys', 'worries', 'worry'], answer: 'worries', rule: 'Consonant + y: change "y" to "-ies"', translation: 'Ele se preocupa que vai se atrasar.' },
  { sentence: 'The new car ___ a powerful engine.', verb: 'have', options: ['has', 'haves', 'have'], answer: 'has', rule: 'Exception for the verb "to have"', translation: 'O carro novo tem um motor potente.' },
  { sentence: 'The politician ___ the issue in his speech.', verb: 'address', options: ['address', 'addresses', 'addresss'], answer: 'addresses', rule: 'Verbs ending in -ss: add "-es"', translation: 'O político aborda a questão em seu discurso.' },
];

// Helper to convert PCM to WAV
function pcmToWav(pcmData: Int16Array, sampleRate: number) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + pcmData.length * bytesPerSample);
  const view = new DataView(buffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length * bytesPerSample, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 8 * bytesPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, pcmData.length * bytesPerSample, true);

  let offset = 44;
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(offset, pcmData[i], true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

export default function ThirdPersonQuiz() {
  const [step, setStep] = useState<'rules' | 'quiz' | 'results'>('rules');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioCache = useRef<Record<string, string>>({});
  const { performAction, showAuthModal, setShowAuthModal } = useAuthAction();
  const { user } = useAuth();

  useEffect(() => {
    if (step === 'results' && user) {
      saveQuizProgress({
        quiz_id: 'third-person',
        score: score,
        total_questions: shuffledQuestions.length,
      });
    }
  }, [step, user, score, shuffledQuestions.length]);

  const startQuiz = () => {
    performAction(() => {
      const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 15);
      setShuffledQuestions(shuffled);
      setStep('quiz');
      setCurrentIndex(0);
      setScore(0);
      setSelectedOption(null);
      setIsAnswered(false);
    });
  };

  const speakSentence = useCallback(async (sentence: string, answer: string) => {
    const fullText = sentence.replace('___', answer);
    if (audioCache.current[fullText]) {
      const audio = new Audio(audioCache.current[fullText]);
      audio.onended = () => setIsSpeaking(false);
      setIsSpeaking(true);
      audio.play().catch(() => setIsSpeaking(false));
      return;
    }

    const fallbackSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = 'en-US';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    };

    try {
      setIsSpeaking(true);
      
      // Check if API key is selected
      if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await (window as any).aistudio.openSelectKey();
        }
      }

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();
      if (!apiKey) {
        throw new Error("API Key not configured.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly: ${fullText}` }] }],
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
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const pcm16 = new Int16Array(bytes.buffer);
        const wavBlob = pcmToWav(pcm16, 24000);
        const audioUrl = URL.createObjectURL(wavBlob);
        audioCache.current[fullText] = audioUrl;
        const audio = new Audio(audioUrl);
        audio.onended = () => setIsSpeaking(false);
        audio.play().catch(() => setIsSpeaking(false));
      } else {
        fallbackSpeak();
      }
    } catch (error) {
      console.error("TTS Error:", error instanceof Error ? error.message : error);
      fallbackSpeak();
    }
  }, []);

  const handleCheck = () => {
    if (!selectedOption) return;
    setIsAnswered(true);
    if (selectedOption === shuffledQuestions[currentIndex].answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setStep('results');
    }
  };

  const currentQuestion = shuffledQuestions[currentIndex];

  return (
    <div className="min-h-screen bg-white dark:bg-[#080e1a] transition-colors duration-300">
      <Navbar />
      
      <main className="pt-28 pb-20 px-6 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'rules' && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-50 dark:bg-[#121a28] p-8 md:p-12 rounded-[2.5rem] border border-gray-200 dark:border-[#424855]/10 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-cyan-400/10 rounded-2xl flex items-center justify-center">
                  <Mic className="w-8 h-8 text-cyan-400" />
                </div>
                <h1 className="font-headline text-3xl font-extrabold text-gray-900 dark:text-[#e5ebfc]">
                  English Grammar Rules
                </h1>
              </div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-bold text-cyan-500 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                    Terceira pessoa do singular do presente:
                  </h2>
                  <div className="space-y-6 pl-10">
                    <div className="border-l-2 border-cyan-500/30 pl-4">
                      <h3 className="font-bold text-gray-900 dark:text-[#e5ebfc]">Acrescenta-se &quot;-s&quot; ao verbo.</h3>
                      <p className="text-gray-500 italic text-sm mt-1">Ex: I send; She sends</p>
                    </div>
                    <div className="border-l-2 border-cyan-500/30 pl-4">
                      <h3 className="font-bold text-gray-900 dark:text-[#e5ebfc]">Quando o verbo termina em &quot;-o, -x, -ss, -ch, -sh&quot;</h3>
                      <p className="text-gray-600 dark:text-[#a5abbb]">Acrescenta-se <span className="text-cyan-500 font-bold">&quot;-es&quot;</span>.</p>
                      <p className="text-gray-500 italic text-sm mt-1">Ex: I wash; She washes</p>
                    </div>
                    <div className="border-l-2 border-cyan-500/30 pl-4">
                      <h3 className="font-bold text-gray-900 dark:text-[#e5ebfc]">Quando verbo terminar em &quot;-y&quot; precedido de consoante</h3>
                      <p className="text-gray-600 dark:text-[#a5abbb]">Corta-se o &quot;-y&quot; e acrescenta-se <span className="text-cyan-500 font-bold">&quot;-ies&quot;</span></p>
                      <p className="text-gray-500 italic text-sm mt-1">Ex: I study; She studies</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-cyan-500 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm">4</span>
                    Exceção para o verbo &quot;to have&quot;:
                  </h2>
                  <div className="pl-10">
                    <p className="text-gray-600 dark:text-[#a5abbb] border-l-2 border-cyan-500/30 pl-4">
                      Que na 3ª pessoa do singular é <span className="text-cyan-500 font-bold">&quot;has&quot;</span>.
                    </p>
                  </div>
                </section>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startQuiz}
                className="w-full mt-12 bg-cyan-500 text-white font-bold py-5 rounded-2xl text-xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all"
              >
                Start Quiz
              </motion.button>
            </motion.div>
          )}

          {step === 'quiz' && currentQuestion && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center">
                <div className="bg-gray-100 dark:bg-[#121a28] px-4 py-2 rounded-xl border border-gray-200 dark:border-[#424855]/20 text-gray-500 font-bold">
                  Question {currentIndex + 1} / {shuffledQuestions.length}
                </div>
                <div className="flex gap-2">
                  {shuffledQuestions.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-2 w-4 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? 'bg-cyan-500 w-8' : idx < currentIndex ? 'bg-cyan-500/40' : 'bg-gray-200 dark:bg-[#121a28]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-[#121a28] p-10 rounded-[2.5rem] border border-gray-200 dark:border-[#424855]/10 shadow-xl relative overflow-hidden">
                <div className="flex flex-col items-center gap-8">
                  <div className="text-2xl md:text-3xl font-headline font-bold text-gray-900 dark:text-[#e5ebfc] text-center leading-relaxed">
                    {currentQuestion.sentence.split('___')[0]}
                    <span className="inline-block mx-2 px-4 py-1 bg-white dark:bg-[#1d2636] border-2 border-cyan-500/30 rounded-xl text-cyan-500 min-w-[120px]">
                      {isAnswered ? currentQuestion.answer : selectedOption || '___'}
                    </span>
                    {currentQuestion.sentence.split('___')[1]}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => speakSentence(currentQuestion.sentence, currentQuestion.answer)}
                      disabled={isSpeaking}
                      className={`p-4 rounded-full transition-all ${
                        isSpeaking ? 'bg-cyan-500 text-white animate-pulse' : 'bg-white dark:bg-[#1d2636] text-cyan-500 border-2 border-cyan-500/20 hover:bg-cyan-50'
                      }`}
                    >
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {currentQuestion.options.map((option) => {
                  let statusClass = "bg-white dark:bg-[#121a28] border-gray-200 dark:border-[#424855]/10 text-gray-700 dark:text-[#e5ebfc] hover:border-cyan-500/50";
                  if (isAnswered) {
                    if (option === currentQuestion.answer) {
                      statusClass = "bg-green-500 text-white border-green-500";
                    } else if (selectedOption === option) {
                      statusClass = "bg-red-500 text-white border-red-500";
                    } else {
                      statusClass = "opacity-50 bg-gray-100 dark:bg-[#121a28] border-transparent text-gray-400";
                    }
                  } else if (selectedOption === option) {
                    statusClass = "border-cyan-500 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400";
                  }

                  return (
                    <motion.button
                      key={option}
                      whileHover={!isAnswered ? { y: -2 } : {}}
                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                      onClick={() => !isAnswered && setSelectedOption(option)}
                      disabled={isAnswered}
                      className={`p-6 rounded-2xl border-2 font-bold text-lg transition-all ${statusClass}`}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className={`p-6 rounded-2xl border flex items-start gap-4 ${
                      selectedOption === currentQuestion.answer 
                        ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400' 
                        : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
                    }`}>
                      {selectedOption === currentQuestion.answer ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <XCircle className="w-6 h-6 shrink-0" />}
                      <div>
                        <p className="font-bold text-lg">{selectedOption === currentQuestion.answer ? 'Correct!' : 'Not quite right'}</p>
                        <p className="opacity-90">{currentQuestion.rule}</p>
                        <p className="mt-2 text-sm italic opacity-70">{currentQuestion.translation}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleNext}
                      className="w-full bg-cyan-500 text-white font-bold py-5 rounded-2xl text-xl flex items-center justify-center gap-2 hover:bg-cyan-600 transition-all"
                    >
                      {currentIndex === shuffledQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isAnswered && (
                <button
                  onClick={handleCheck}
                  disabled={!selectedOption}
                  className="w-full bg-cyan-500 text-white font-bold py-5 rounded-2xl text-xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              )}
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="mb-8 flex justify-center">
                <div className="w-32 h-32 bg-cyan-500/10 rounded-full flex items-center justify-center">
                  <Trophy className="w-16 h-16 text-cyan-500" />
                </div>
              </div>
              <h2 className="font-headline text-4xl font-extrabold mb-4 text-gray-900 dark:text-[#e5ebfc]">
                Quiz Complete!
              </h2>
              <div className="text-7xl font-black text-cyan-500 mb-6">
                {score} / {shuffledQuestions.length}
              </div>
              <p className="text-xl text-gray-600 dark:text-[#a5abbb] mb-12">
                {score === shuffledQuestions.length 
                  ? "Perfect Score! You're a grammar master!" 
                  : score >= shuffledQuestions.length * 0.8 
                  ? "Excellent work! You really know your stuff." 
                  : score >= shuffledQuestions.length * 0.5 
                  ? "Good job! A little more practice and you'll be perfect." 
                  : "Keep practicing! You'll get there."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Try Again
                </motion.button>
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-100 dark:bg-[#121a28] text-gray-900 dark:text-[#e5ebfc] px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Menu
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

interface TrophyProps {
  className?: string;
}

function Trophy({ className }: TrophyProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
