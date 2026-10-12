'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  GraduationCap, 
  Building, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight,
  Filter,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface MajorGrant {
  code: string;
  name: string;
  university: string;
  city: string;
  minScore: number;
  grantPlaces: number;
  competition: string;
}

const majorsDatabase: Record<string, MajorGrant[]> = {
  'math-phys': [
    { code: 'B057', name: 'Ақпараттық технологиялар & Software Engineering', university: 'KBTU (ҚБТУ)', city: 'Алматы', minScore: 125, grantPlaces: 450, competition: 'Жоғары' },
    { code: 'B058', name: 'Киберқауіпсіздік және желілер', university: 'IITU (ХАТУ)', city: 'Алматы', minScore: 118, grantPlaces: 320, competition: 'Орташа' },
    { code: 'B059', name: 'Жасанды интеллект және Data Science', university: 'SDU University', city: 'Алматы', minScore: 124, grantPlaces: 280, competition: 'Жоғары' },
    { code: 'B064', name: 'Автоматтандыру және робототехника', university: 'Satbayev University', city: 'Алматы', minScore: 108, grantPlaces: 600, competition: 'Қолжетімді' },
    { code: 'B054', name: 'Компьютерлік инженерия', university: 'ENU (ЕҰУ)', city: 'Астана', minScore: 114, grantPlaces: 350, competition: 'Орташа' },
    { code: 'B062', name: 'Электроэнергетика және жылу энергетикасы', university: 'AUPET (Ғ. Дәукеев атындағы)', city: 'Алматы', minScore: 98, grantPlaces: 500, competition: 'Қолжетімді' }
  ],
  'chem-bio': [
    { code: 'B086', name: 'Жалпы медицина (Дәрігер)', university: 'С.Ж. Асфендияров атындағы ҚазҰМУ', city: 'Алматы', minScore: 130, grantPlaces: 1200, competition: 'Өте жоғары' },
    { code: 'B087', name: 'Стоматология', university: 'Астана медицина университеті (AMU)', city: 'Астана', minScore: 134, grantPlaces: 180, competition: 'Ең жоғары' },
    { code: 'B088', name: 'Фармация және дәрі-дәрмек өндірісі', university: 'ҚазҰМУ', city: 'Алматы', minScore: 118, grantPlaces: 300, competition: 'Орташа' },
    { code: 'B050', name: 'Биология және генетика', university: 'Әл-Фараби атындағы ҚазҰУ', city: 'Алматы', minScore: 112, grantPlaces: 400, competition: 'Орташа' },
    { code: 'B053', name: 'Химиялық технология және инженерия', university: 'KBTU', city: 'Алматы', minScore: 115, grantPlaces: 250, competition: 'Орташа' }
  ],
  'geo-math': [
    { code: 'B044', name: 'Қаржы және Аудит (Finance)', university: 'KAZGUU (MNU)', city: 'Астана', minScore: 122, grantPlaces: 150, competition: 'Жоғары' },
    { code: 'B046', name: 'IT-Маркетинг және логистика', university: 'SDU University', city: 'Алматы', minScore: 116, grantPlaces: 200, competition: 'Орташа' },
    { code: 'B045', name: 'Менеджмент және Халықаралық бизнес', university: 'AlmaU', city: 'Алматы', minScore: 110, grantPlaces: 180, competition: 'Орташа' },
    { code: 'B091', name: 'Туризм және қонақжайлылық', university: 'ЕҰУ (ENU)', city: 'Астана', minScore: 104, grantPlaces: 300, competition: 'Қолжетімді' }
  ],
  'history-law': [
    { code: 'B049', name: 'Құқықтану және сот сараптамасы', university: 'KAZGUU (MNU)', city: 'Астана', minScore: 128, grantPlaces: 250, competition: 'Өте жоғары' },
    { code: 'B049', name: 'Заңтану (Мемлекеттік грант)', university: 'Әл-Фараби атындағы ҚазҰУ', city: 'Алматы', minScore: 126, grantPlaces: 300, competition: 'Жоғары' },
    { code: 'B048', name: 'Мемлекеттік және жергілікті басқару', university: 'ЕҰУ (ENU)', city: 'Астана', minScore: 118, grantPlaces: 180, competition: 'Орташа' }
  ],
  'eng-history': [
    { code: 'B042', name: 'Халықаралық қатынастар және дипломатия', university: 'ҚазҰУ / ЕҰУ', city: 'Алматы / Астана', minScore: 132, grantPlaces: 160, competition: 'Ең жоғары' },
    { code: 'B043', name: 'Аударма ісі және шетел филологиясы', university: 'ҚазҰУ', city: 'Алматы', minScore: 120, grantPlaces: 220, competition: 'Жоғары' },
    { code: 'B018', name: 'Шет тілі мұғалімдерін даярлау', university: 'ҚазҰПУ (Абай атындағы)', city: 'Алматы', minScore: 110, grantPlaces: 800, competition: 'Орташа' }
  ]
};

export const GrantCalculator: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<string>('math-phys');
  const [score, setScore] = useState<number>(122);
  const [cityFilter, setCityFilter] = useState<string>('all');

  const pairs = [
    { id: 'math-phys', label: 'Мат - Физ', full: 'Математика + Физика' },
    { id: 'chem-bio', label: 'Хим - Био', full: 'Химия + Биология' },
    { id: 'geo-math', label: 'Гео - Мат', full: 'География + Математика' },
    { id: 'history-law', label: 'Тарих - Құқық', full: 'Дүниежүзі тарихы + Құқық' },
    { id: 'eng-history', label: 'Ағылшын - Тарих', full: 'Шет тілі + Дүниежүзі тарихы' },
  ];

  const currentMajors = majorsDatabase[selectedPair] || [];
  const filteredMajors = currentMajors.filter(m => {
    if (cityFilter === 'all') return true;
    return m.city.includes(cityFilter);
  });

  return (
    <section id="grant-calc" className="py-24 relative bg-slate-100 dark:bg-juz-dark">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-juz-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-juz-500/10 border border-juz-500/20 text-juz-300 text-xs font-semibold uppercase tracking-wider">
            <Calculator className="w-4 h-4 text-juz-400" />
            <span>ҰБТ 2026 Интерактивті Калькуляторы</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Грант және 140 Балл Калькуляторы
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Бейіндік жұбыңды таңдап, балыңды көрсет — қай ЖОО мен мамандыққа мемлекеттік грантқа түсе алатыныңды бірден анықта.
          </p>
        </div>

        {/* Control Box */}
        <div className="p-6 sm:p-8 rounded-3xl juz-card border border-juz-500/30 shadow-2xl mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Subject Pair selector */}
            <div className="lg:col-span-6 space-y-3">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                1. Бейіндік пән жұбын таңдаңыз:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pairs.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPair(p.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-left ${
                      selectedPair === p.id
                        ? 'bg-juz-gradient text-slate-900 dark:text-white shadow-lg shadow-juz-500/30 scale-[1.02]'
                        : 'bg-slate-100 dark:bg-juz-dark/70 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-white/5'
                    }`}
                  >
                    <div className="truncate">{p.label}</div>
                    <div className="text-[10px] opacity-75 truncate">{p.full.split('+')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Score Slider */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  2. ҰБТ балың (Болжам):
                </label>
                <span className="text-2xl font-black text-juz-gold flex items-center gap-1 font-sans">
                  {score} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/ 140 балл</span>
                </span>
              </div>

              <input
                type="range"
                min="65"
                max="140"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-100 dark:bg-juz-dark rounded-lg appearance-none cursor-pointer accent-juz-500 border border-slate-200 dark:border-white/10"
              />

              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold pt-1">
                <span>65 балл (Шекті)</span>
                <span>100 балл</span>
                <span>120 балл</span>
                <span className="text-juz-gold font-bold">140 балл (Рекорд)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Табылған гранттық мамандықтар: <span className="text-slate-900 dark:text-white font-bold">{filteredMajors.length} бағыт</span>
            </div>
            
            {/* City filter tabs */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">Қала бойынша:</span>
              {['all', 'Алматы', 'Астана'].map(c => (
                <button
                  key={c}
                  onClick={() => setCityFilter(c)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    cityFilter === c
                      ? 'bg-juz-500 text-slate-900 dark:text-white font-bold'
                      : 'bg-white dark:bg-juz-card text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-white/5'
                  }`}
                >
                  {c === 'all' ? 'Барлығы' : c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMajors.map((major, idx) => {
              const isEligible = score >= major.minScore;
              const pointsDiff = score - major.minScore;

              return (
                <motion.div
                  key={`${major.code}-${idx}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className={`p-5 rounded-2xl juz-card border transition-all duration-300 ${
                    isEligible
                      ? 'border-emerald-500/40 hover:border-emerald-400/80 bg-gradient-to-b from-emerald-950/20 to-juz-card'
                      : 'border-slate-200 dark:border-white/10 hover:border-juz-500/30 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-juz-dark border border-slate-200 dark:border-white/10 text-juz-300">
                      {major.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isEligible
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {isEligible ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Грант мүмкіндігі: {pointsDiff > 8 ? '98%' : '85%'}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span>Тағы +{Math.abs(pointsDiff)} балл қажет</span>
                        </>
                      )}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2">
                    {major.name}
                  </h4>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/70 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-juz-400" />
                        ЖОО:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{major.university}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Өткен жылғы шекті балл:</span>
                      <span className="font-bold text-juz-gold font-sans">{major.minScore} балл</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Мемлекеттік гранттар саны:</span>
                      <span className="text-slate-700 dark:text-slate-200 font-medium">{major.grantPlaces} орын</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-200/70 dark:border-white/5">
                    <Link
                      href="#tariffs"
                      className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isEligible
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-juz-500/10 hover:bg-juz-500/20 text-juz-300 border border-juz-500/30'
                      }`}
                    >
                      <span>{isEligible ? 'Баллды бекіту үшін курс таңдау' : 'Баллды өсіретін курс'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
