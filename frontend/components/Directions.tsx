'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Calculator, 
  Atom, 
  FlaskConical, 
  Globe, 
  Landmark, 
  Languages, 
  Scale, 
  Sparkles, 
  ArrowRight,
  GraduationCap,
  Layers,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface SubjectItem {
  id: string;
  name: string;
  category: 'mandatory' | 'profile' | 'specialized';
  subtitle: string;
  teacher: string;
  lessonsCount: number;
  testsCount: number;
  icon: React.ReactNode;
  accentColor: string;
  badge: string;
}

const subjectsList: SubjectItem[] = [
  // Mandatory
  {
    id: 'math-lit',
    name: 'Математикалық сауаттылық',
    category: 'mandatory',
    subtitle: 'Логика, диаграммалар және жылдам есептеу тактикасы',
    teacher: 'Нұрсұлтан Саматұлы',
    lessonsCount: 42,
    testsCount: 950,
    icon: <Calculator className="w-6 h-6 text-juz-400" />,
    accentColor: 'border-juz-500/30 hover:border-juz-400',
    badge: 'Міндетті • 20 балл'
  },
  {
    id: 'history-kz',
    name: 'Қазақстан тарихы',
    category: 'mandatory',
    subtitle: 'Хронология, мемлекеттер, тұлғалар және ҰБT жаңа базасы',
    teacher: 'Айгүл Бауыржанқызы',
    lessonsCount: 48,
    testsCount: 1400,
    icon: <Landmark className="w-6 h-6 text-amber-400" />,
    accentColor: 'border-amber-500/30 hover:border-amber-400',
    badge: 'Міндетті • 20 балл'
  },
  {
    id: 'reading-lit',
    name: 'Оқу сауаттылығы',
    category: 'mandatory',
    subtitle: 'Мәтінді талдау, контекст бойынша дұрыс жауапты табу',
    teacher: 'Мөлдір Кеңесқызы',
    lessonsCount: 36,
    testsCount: 800,
    icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
    accentColor: 'border-emerald-500/30 hover:border-emerald-400',
    badge: 'Міндетті • 10 балл'
  },

  // Profile pairs
  {
    id: 'math-prof',
    name: 'Математика (бейіндік)',
    category: 'profile',
    subtitle: 'Тригонометрия, туынды, интеграл, стереометрия есептері',
    teacher: 'Ернар Болатұлы',
    lessonsCount: 64,
    testsCount: 1800,
    icon: <Calculator className="w-6 h-6 text-cyan-400" />,
    accentColor: 'border-cyan-500/30 hover:border-cyan-400',
    badge: 'Бейіндік • 50 балл'
  },
  {
    id: 'physics',
    name: 'Физика',
    category: 'profile',
    subtitle: 'Механика, термодинамика, электродинамика, оптика',
    teacher: 'Дәулет Сейітқали',
    lessonsCount: 60,
    testsCount: 1600,
    icon: <Atom className="w-6 h-6 text-indigo-400" />,
    accentColor: 'border-indigo-500/30 hover:border-indigo-400',
    badge: 'Бейіндік • 50 балл'
  },
  {
    id: 'chemistry',
    name: 'Химия',
    category: 'profile',
    subtitle: 'Органика, бейорганика, реакция теңдеулері мен есептері',
    teacher: 'Аружан Дәуренқызы',
    lessonsCount: 56,
    testsCount: 1500,
    icon: <FlaskConical className="w-6 h-6 text-rose-400" />,
    accentColor: 'border-rose-500/30 hover:border-rose-400',
    badge: 'Бейіндік • 50 балл'
  },
  {
    id: 'biology',
    name: 'Биология',
    category: 'profile',
    subtitle: 'Генетика, цитология, анатомия, эволюция және медицинаға жол',
    teacher: 'Жанна Қасымбек',
    lessonsCount: 58,
    testsCount: 1650,
    icon: <Globe className="w-6 h-6 text-teal-400" />,
    accentColor: 'border-teal-500/30 hover:border-teal-400',
    badge: 'Бейіндік • 50 балл'
  },
  {
    id: 'geography',
    name: 'География',
    category: 'profile',
    subtitle: 'Физикалық және экономикалық география, карталар, демография',
    teacher: 'Аслан Төлеубай',
    lessonsCount: 50,
    testsCount: 1200,
    icon: <Globe className="w-6 h-6 text-emerald-400" />,
    accentColor: 'border-emerald-500/30 hover:border-emerald-400',
    badge: 'Бейіндік • 50 балл'
  },
  {
    id: 'english',
    name: 'Ағылшын тілі',
    category: 'profile',
    subtitle: 'Grammar, Reading, Vocabulary, халықаралық қатынастар бейіні',
    teacher: 'Камила Назарбаева',
    lessonsCount: 52,
    testsCount: 1400,
    icon: <Languages className="w-6 h-6 text-sky-400" />,
    accentColor: 'border-sky-500/30 hover:border-sky-400',
    badge: 'Бейіндік • 50 балл'
  },
  {
    id: 'law-world',
    name: 'Дүниежүзі тарихы & АҚҚ',
    category: 'profile',
    subtitle: 'Заң, құқықтану, әлем өркениеттері және конституциялық құқық',
    teacher: 'Бауыржан Темірлан',
    lessonsCount: 46,
    testsCount: 1100,
    icon: <Scale className="w-6 h-6 text-violet-400" />,
    accentColor: 'border-violet-500/30 hover:border-violet-400',
    badge: 'Бейіндік • 50 балл'
  },

  // Specialized: NIS, BIL, RFMSH
  {
    id: 'nis-prep',
    name: 'NIS (Назарбаев Мектептері)',
    category: 'specialized',
    subtitle: '5-6 сыныптар үшін сандық сипаттамалар мен кеңістіктік логика',
    teacher: 'Ердос Бекенұлы',
    lessonsCount: 45,
    testsCount: 1200,
    icon: <GraduationCap className="w-6 h-6 text-juz-400" />,
    accentColor: 'border-juz-500/30 hover:border-juz-400',
    badge: 'Арнайы емтихан'
  },
  {
    id: 'bil-prep',
    name: 'BIL (Білім-Инновация)',
    category: 'specialized',
    subtitle: 'Олимпиадалық логикалық тапсырмалар мен қазақ-ағылшын тілі',
    teacher: 'Санжар Әлімжан',
    lessonsCount: 40,
    testsCount: 1050,
    icon: <Award className="w-6 h-6 text-emerald-400" />,
    accentColor: 'border-emerald-500/30 hover:border-emerald-400',
    badge: 'Лицейге түсу'
  }
];

export const Directions: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'mandatory' | 'profile' | 'specialized'>('all');

  const filteredSubjects = subjectsList.filter(s => {
    if (activeFilter === 'all') return true;
    return s.category === activeFilter;
  });

  return (
    <section id="directions" className="py-24 relative bg-slate-100 dark:bg-juz-dark">
      {/* Background radial accents */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-juz-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-juz-800/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-juz-500/10 border border-juz-500/20 text-juz-300 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-juz-400" />
            <span>16 Пән бойынша толық қамту</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Барлық ҰБТ Пәндері мен Бағыттары
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            ҰБT-ның жаңа тест форматы мен спецификациясына 100% сай келетін интерактивті сабақтар базасы.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {[
            { key: 'all', label: 'Барлық 16 пән' },
            { key: 'mandatory', label: 'Міндетті пәндер (3 пән)' },
            { key: 'profile', label: 'Бейіндік жұптар' },
            { key: 'specialized', label: 'NIS / BIL / РФММ' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === tab.key
                  ? 'bg-gradient-to-r from-juz-600 to-juz-500 text-slate-900 dark:text-white shadow-lg shadow-juz-500/25 border border-juz-400/40'
                  : 'bg-white dark:bg-juz-card/70 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:bg-juz-card border border-slate-200/70 dark:border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`rounded-2xl juz-card p-6 border ${item.accentColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-juz-500/10 flex flex-col justify-between group`}
            >
              <div className="space-y-4">
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-juz-dark/90 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-juz-dark/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    {item.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-juz-300 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>

                {/* Teacher & Metrics */}
                <div className="pt-3 border-t border-slate-200/70 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Оқытушы:</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{item.teacher}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{item.lessonsCount} бейнесабақ</span>
                    <span>•</span>
                    <span className="text-juz-400 font-medium">{item.testsCount}+ тест сұрағы</span>
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="pt-5 mt-4 border-t border-slate-200/70 dark:border-white/5">
                <Link
                  href="#test-engine"
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-juz-dark/90 hover:bg-juz-500 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold border border-slate-200 dark:border-white/10 hover:border-juz-400 transition-all flex items-center justify-center gap-2 group-hover:bg-juz-500 group-hover:text-slate-900 dark:group-hover:text-white"
                >
                  <span>Сабақты бастау</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
