'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw,
  Trophy,
  Zap,
  HelpCircle,
  Award,
  BookOpen
} from 'lucide-react';
import { Test, TestAttemptResult } from '@/lib/api';

const sampleTest: Test = {
  id: 'juz40-demo-test',
  title: 'Zerdeli: ҰБТ 140 Балл Байқау Сынақ Тренажері',
  description: 'Ұлттық тестілеу орталығының (ҰТО) 2026 жаңа форматы бойынша дайындалған интерактивті сынақ.',
  direction: 'UNT',
  duration_minutes: 15,
  passing_score: 70,
  questions: [
    {
      id: 'q1',
      question_text: 'Математикалық сауаттылық: Тіктөртбұрыштың ұзындығы 20%-ға арттырылып, ені 10%-ға кемітілді. Тіктөртбұрыштың ауданы қалай өзгерді?',
      question_type: 'single_choice',
      points: 20,
      options: [
        { id: 'o1', option_text: '8%-ға артты' },
        { id: 'o2', option_text: '10%-ға артты' },
        { id: 'o3', option_text: '不变 (өзгерген жоқ)' },
        { id: 'o4', option_text: '5%-ға кеміді' }
      ]
    },
    {
      id: 'q2',
      question_text: 'Қазақстан тарихы: 1993 жылы 15 қарашада Қазақстан тарихында қандай айтулы оқиға орын алды?',
      question_type: 'single_choice',
      points: 20,
      options: [
        { id: 'o5', option_text: 'Төл валюта — Теңге айналымға енгізілді' },
        { id: 'o6', option_text: 'Тұңғыш Конституция қабылданды' },
        { id: 'o7', option_text: 'Қазақстан БҰҰ-ға мүше болып қабылданды' },
        { id: 'o8', option_text: 'Семей полигоны жабылды' }
      ]
    },
    {
      id: 'q3',
      question_text: 'Оқу сауаттылығы: «Ғылым таппай мақтанба, орын таппай баптанба...» өлеңінің негізгі идеясы мен авторын көрсетіңіз:',
      question_type: 'single_choice',
      points: 20,
      options: [
        { id: 'o9', option_text: 'Абай Құнанбайұлы — Жастарды білім мен еңбекке шақыру' },
        { id: 'o10', option_text: 'Шәкәрім Құдайбердіұлы — Тарихты зерттеу' },
        { id: 'o11', option_text: 'Ыбырай Алтынсарин — Әліппе оқыту' },
        { id: 'o12', option_text: 'Ахмет Байтұрсынұлы — Тіл білімі' }
      ]
    },
    {
      id: 'q4',
      question_text: 'Логика және есептеу: Пойыз 240 км қашықтықты 3 сағатта өтті. Осы жылдамдықпен 400 км қашықтықты қанша сағатта жүріп өтеді? (Сан түрінде енгізіңіз):',
      question_type: 'numerical',
      points: 20,
      options: []
    }
  ]
};

// Explanations for each question
const explanations: Record<string, string> = {
  q1: '💡 Куратор түсіндірмесі: Бастапқы аудан S = a * b. Жаңа аудан S1 = (1.20a) * (0.90b) = 1.08 * ab = 108% S. Демек, аудан 8%-ға артты.',
  q2: '💡 Куратор түсіндірмесі: 1993 жылдың 15 қарашасында Қазақстан Республикасының Ұлттық валютасы — Теңге ресми түрде айналымға енгізілді. Бұл күн Қаржыгерлер күні болып белгіленген.',
  q3: '💡 Куратор түсіндірмесі: Ұлы Абай бұл өлеңінде бес асыл іс пен бес дұшпанды сипаттап, адам болудың кілті ғылым-білімде екенін жеткізеді.',
  q4: '💡 Куратор түсіндірмесі: Жылдамдық v = 240 / 3 = 80 км/сағ. Уақыт t = 400 / 80 = 5 сағат. Дұрыс жауап: 5.'
};

export const TestEngineComponent: React.FC = () => {
  const [testState, setTestState] = useState<'intro' | 'running' | 'completed'>('intro');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, { selected: string[]; numerical?: string }>>({});
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [result, setResult] = useState<TestAttemptResult | null>(null);

  useEffect(() => {
    let timer: any;
    if (testState === 'running' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && testState === 'running') {
      handleSubmit();
    }
    return () => clearInterval(timer);
  }, [testState, timeLeft]);

  const handleStart = () => {
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(15 * 60);
    setTestState('running');
  };

  const currentQ = sampleTest.questions[currentIdx];

  const handleSelectOption = (optId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { selected: [optId] }
    }));
  };

  const handleNumericalInput = (val: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { selected: [], numerical: val }
    }));
  };

  const handleSubmit = () => {
    let earned = 0;
    const total = 80;

    // Evaluate answers
    if (answers['q1']?.selected?.includes('o1')) earned += 20;
    if (answers['q2']?.selected?.includes('o5')) earned += 20;
    if (answers['q3']?.selected?.includes('o9')) earned += 20;
    if (answers['q4']?.numerical?.trim() === '5') earned += 20;

    const percentage = (earned / total) * 100;
    const isPassed = percentage >= sampleTest.passing_score;

    setResult({
      attempt_id: 'att-' + Date.now(),
      test_id: sampleTest.id,
      test_title: sampleTest.title,
      score: earned,
      max_score: total,
      percentage: Math.round(percentage),
      passed: isPassed,
      answers: []
    });

    setTestState('completed');
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section id="test-engine" className="py-24 relative bg-slate-100 dark:bg-juz-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Intro Screen */}
        {testState === 'intro' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 sm:p-12 rounded-3xl juz-card border border-juz-500/30 text-center space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-juz-600 to-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-juz-500/30">
              <Trophy className="w-8 h-8 text-slate-900 dark:text-white" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full badge-140 text-xs font-bold">
              <span>ҰБТ 140 СЫНАҚ ТРЕНАЖЕРІ</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {sampleTest.title}
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              {sampleTest.description} Сынақтан өтіп, ҰБТ-ға дайындық деңгейіңіз бен куратор кеңесін лезде алыңыз.
            </p>

            {/* Test info pills */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-juz-dark/80 border border-slate-200/70 dark:border-white/5">
                <div className="text-slate-500 dark:text-slate-400">Сұрақтар:</div>
                <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{sampleTest.questions.length} сұрақ</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-juz-dark/80 border border-slate-200/70 dark:border-white/5">
                <div className="text-slate-500 dark:text-slate-400">Уақыты:</div>
                <div className="text-sm font-bold text-juz-400 mt-0.5">15 минут</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-juz-dark/80 border border-slate-200/70 dark:border-white/5">
                <div className="text-slate-500 dark:text-slate-400">Өту балы:</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">70% (Грант)</div>
              </div>
            </div>

            <div>
              <button
                onClick={handleStart}
                className="px-8 py-4 rounded-2xl juz-btn-primary font-bold text-base shadow-xl hover:scale-105 inline-flex items-center gap-2"
              >
                <span>Сынақты бастау (140)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Running Test Interface */}
        {testState === 'running' && (
          <div className="p-6 sm:p-10 rounded-3xl juz-card border border-juz-500/30 shadow-2xl space-y-6">
            
            {/* Header / Nav */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-juz-500/20 text-juz-400 font-bold text-xs flex items-center justify-center border border-juz-500/30">
                  {currentIdx + 1}/{sampleTest.questions.length}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 hidden sm:inline">
                  ҰБТ Сынақ режимі
                </span>
              </div>

              {/* Countdown timer */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-juz-dark/90 border border-juz-500/30 font-mono text-sm font-bold text-juz-400">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Question Tabs */}
            <div className="flex gap-2">
              {sampleTest.questions.map((q, idx) => {
                const isAnswered = !!answers[q.id]?.selected?.length || !!answers[q.id]?.numerical;
                const isCurrent = idx === currentIdx;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-juz-500 text-slate-900 dark:text-white shadow-md'
                        : isAnswered
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-juz-dark text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    №{idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Question Text */}
            <div className="space-y-4 py-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQ.question_text}
              </h3>

              {/* Options */}
              {currentQ.question_type === 'single_choice' && (
                <div className="space-y-3 pt-2">
                  {currentQ.options.map(opt => {
                    const isSelected = answers[currentQ.id]?.selected?.includes(opt.id);

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 border ${
                          isSelected
                            ? 'bg-juz-500/20 border-juz-400 text-slate-900 dark:text-white shadow-md shadow-juz-500/15'
                            : 'bg-slate-100 dark:bg-juz-dark/70 border-slate-200/70 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-white dark:bg-juz-card hover:border-slate-200 dark:border-white/10'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                          isSelected ? 'border-juz-400 bg-juz-500 text-slate-900 dark:text-white' : 'border-slate-500'
                        }`}>
                          {isSelected && <span className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span>{opt.option_text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Numerical */}
              {currentQ.question_type === 'numerical' && (
                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="Сандық мәнді жазыңыз (мысалы, 5)"
                    value={answers[currentQ.id]?.numerical || ''}
                    onChange={(e) => handleNumericalInput(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-slate-100 dark:bg-juz-dark border border-juz-500/30 text-slate-900 dark:text-white text-base font-bold focus:outline-none focus:border-juz-400 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Bottom Nav Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/10">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-juz-dark border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Алдыңғы</span>
              </button>

              {currentIdx < sampleTest.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="px-5 py-2.5 rounded-xl juz-btn-primary text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Келесі сұрақ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-1.5"
                >
                  <span>Сынақты аяқтау</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        )}

        {/* Completed / Results Screen */}
        {testState === 'completed' && result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 sm:p-12 rounded-3xl juz-card border border-juz-500/40 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-juz-gold to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
                <Trophy className="w-8 h-8 text-slate-900 dark:text-white" />
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full badge-140">
                140 СЫНАҚ НӘТИЖЕСІ
              </span>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {result.passed ? 'Құттықтаймыз! Керемет нәтиже 🎉' : 'Сынақ аяқталды!'}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {result.passed 
                  ? 'Сіздің дайындық деңгейіңіз мемлекеттік грант шегінен сенімді өтіп тұр!' 
                  : 'Қатемен жұмыс жасап, ұпайыңызды 140-қа дейін жеткізуге болады.'}
              </p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 text-center text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-juz-dark/80 border border-slate-200/70 dark:border-white/5">
                <div className="text-slate-500 dark:text-slate-400">Жинаған балл:</div>
                <div className="text-xl font-black text-slate-900 dark:text-white font-sans mt-1">{result.score} / {result.max_score}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-juz-dark/80 border border-slate-200/70 dark:border-white/5">
                <div className="text-slate-500 dark:text-slate-400">Нәтиже:</div>
                <div className="text-xl font-black text-juz-400 font-sans mt-1">{result.percentage}%</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-juz-dark/80 border border-slate-200/70 dark:border-white/5">
                <div className="text-slate-500 dark:text-slate-400">Грант мүмкіндігі:</div>
                <div className="text-xl font-black text-emerald-400 font-sans mt-1">{result.percentage >= 70 ? '98%' : '75%'}</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-juz-dark/80 border border-slate-200/70 dark:border-white/5">
                <div className="text-slate-500 dark:text-slate-400">140 Мақсат:</div>
                <div className="text-xl font-black text-juz-gold font-sans mt-1">Жақын</div>
              </div>
            </div>

            {/* Error Analysis / Curator Explanations */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-juz-400" />
                Сұрақтар мен куратор түсіндірмелері:
              </h4>

              {sampleTest.questions.map((q) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-100 dark:bg-juz-dark/70 border border-slate-200/70 dark:border-white/5 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">{q.question_text}</div>
                  <div className="text-juz-300 leading-relaxed bg-juz-950/60 p-2.5 rounded-xl border border-juz-500/20">
                    {explanations[q.id]}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-juz-dark border border-slate-200 dark:border-white/10 hover:border-white/30 text-xs font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Қайта тапсыру</span>
              </button>

              <a
                href="#tariffs"
                className="w-full sm:w-auto px-7 py-3 rounded-xl juz-btn-primary text-xs font-bold text-center"
              >
                140 Балл курсына жазылу
              </a>
            </div>

          </motion.div>
        )}

      </div>
    </section>
  );
};
