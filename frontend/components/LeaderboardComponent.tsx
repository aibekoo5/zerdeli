'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Flame, Star, Medal, Sparkles, GraduationCap, Quote } from 'lucide-react';
import { LeaderboardUser } from '@/lib/api';

interface TopGraduate {
  name: string;
  score: number;
  maxScore: number;
  subjectPair: string;
  university: string;
  major: string;
  avatar: string;
  quote: string;
  badge: string;
}

const graduates140: TopGraduate[] = [
  {
    name: 'Ақбота Нұрланқызы',
    score: 140,
    maxScore: 140,
    subjectPair: 'Мат - Физ',
    university: 'Nazarbayev University (NU)',
    major: 'Computer Science & Software',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    quote: 'Zerdeli-тың қатемен жұмыс әдістемесі мен кураторымның күнделікті бақылауы 140/140 балл жинауыма 100% көмектесті!',
    badge: '140 РЕКОРД'
  },
  {
    name: 'Дінмұхаммед Ерланұлы',
    score: 140,
    maxScore: 140,
    subjectPair: 'Мат - Физ',
    university: 'SDU University',
    major: 'Artificial Intelligence',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    quote: 'Байқау сынақтары нағыз ҰТО емтиханымен бірдей болды. Емтиханда ешқандай қорқыныш болмады.',
    badge: '140 РЕКОРД'
  },
  {
    name: 'Аружан Қасымова',
    score: 139,
    maxScore: 140,
    subjectPair: 'Хим - Био',
    university: 'С.Ж. Асфендияров ҚазҰМУ',
    major: 'Жалпы медицина (Грант)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    quote: 'Биология мен химиядан 10-30 минуттық сабақтар формулалар мен реакцияларды жаттауды жеңілдетті.',
    badge: '139 БАЛЛ'
  },
  {
    name: 'Айбек Аманжолов',
    score: 138,
    maxScore: 140,
    subjectPair: 'Гео - Мат',
    university: 'KBTU (ҚБТУ)',
    major: 'IT-Finance & Logistics',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    quote: 'Басында 85 балл жинайтынмын. 5 айдың ішінде 138 баллға жеттім. Zerdeli — нағыз мүмкіндіктер мекені!',
    badge: '138 БАЛЛ'
  }
];

export const LeaderboardComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'graduates' | 'weekly'>('graduates');

  return (
    <section id="leaderboard" className="py-24 relative bg-slate-100 dark:bg-juz-dark/95">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-juz-gold/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-juz-gold text-xs font-semibold uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-juz-gold" />
            <span>Zerdeli Жетістіктері & Даңқ Тақтасы</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            140 Балл Рекордшылары және Түлектеріміз
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Қазақстанның жетекші университеттеріне мемлекеттік грант ұтып алған мақтаныштарымыз.
          </p>
        </div>

        {/* Top 140 Graduates Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {graduates140.map((student, idx) => (
            <motion.div
              key={student.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="p-6 rounded-3xl juz-card border border-juz-500/30 hover:border-juz-gold/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Gold gradient top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-juz-gold via-amber-400 to-juz-500" />

              <div className="space-y-4">
                {/* Avatar and Badge */}
                <div className="flex items-center justify-between">
                  <div className="relative">
                    <img 
                      src={student.avatar} 
                      alt={student.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-juz-gold/40 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-juz-gold flex items-center justify-center text-juz-dark font-black text-[10px]">
                      ★
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full badge-140 text-xs font-black">
                    {student.score} / {student.maxScore}
                  </span>
                </div>

                {/* Name & Major */}
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-juz-300 transition-colors">
                    {student.name}
                  </h4>
                  <p className="text-xs text-juz-400 font-medium mt-0.5">
                    {student.subjectPair} • 100% Грант
                  </p>
                </div>

                {/* University Info */}
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-juz-dark/80 border border-slate-200/70 dark:border-white/5 space-y-1 text-xs">
                  <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Түскен оқу орны:</span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white leading-tight">{student.university}</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">{student.major}</div>
                </div>

                {/* Quote */}
                <div className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed pt-1 relative">
                  <Quote className="w-4 h-4 text-juz-gold/30 absolute -top-1 -left-1" />
                  <p className="pl-4">«{student.quote}»</p>
                </div>
              </div>

              {/* Bottom tag */}
              <div className="pt-4 mt-4 border-t border-slate-200/70 dark:border-white/5 flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                <span>Мемлекеттік Грант</span>
                <span className="text-slate-500 dark:text-slate-400">Zerdeli Түлегі</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-5 rounded-2xl juz-card border border-slate-200/70 dark:border-white/5">
            <div className="text-2xl sm:text-3xl font-black text-juz-gold font-sans">86 000+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Түлектер саны</div>
          </div>
          <div className="p-5 rounded-2xl juz-card border border-slate-200/70 dark:border-white/5">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-sans">94.8%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Грант иегерлері</div>
          </div>
          <div className="p-5 rounded-2xl juz-card border border-slate-200/70 dark:border-white/5">
            <div className="text-2xl sm:text-3xl font-black text-juz-400 font-sans">130+ балл</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Оқушылардың орташа көрсеткіші</div>
          </div>
          <div className="p-5 rounded-2xl juz-card border border-slate-200/70 dark:border-white/5">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-sans">140 / 140</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Максималды абсолюттік балл</div>
          </div>
        </div>

      </div>
    </section>
  );
};
