'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Flame,
  Gem,
  PlayCircle,
  ClipboardCheck,
  BarChart3,
  ArrowRight,
  CalendarClock,
  ShoppingBag,
  Lock,
} from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { getMyDashboard } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';

function fmtDue(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const now = new Date();
  const days = Math.round((d.getTime() - now.getTime()) / 86400000);
  const t = d.toLocaleTimeString('kk', { hour: '2-digit', minute: '2-digit' });
  if (days <= 0) return `Бүгін, ${t}`;
  if (days === 1) return `Ертең, ${t}`;
  return `${days} күннен кейін`;
}

export default function StudentDashboardPage() {
  const { data, loading, error, reload } = useApi(getMyDashboard);

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  const name = data.full_name?.split(' ')[0] || 'Оқушы';
  const hasCourses = data.active_courses.length > 0;

  const tiles = [
    {
      href: hasCourses && data.active_courses[0].next_lesson_id
        ? `/student/player?course=${data.active_courses[0].id}&lesson=${data.active_courses[0].next_lesson_id}`
        : '/student/courses',
      label: 'Сабақты жалғастыру',
      sub: hasCourses ? data.active_courses[0].title.slice(0, 24) : 'Курс таңдау',
      Icon: PlayCircle,
      tint: 'bg-zerdeli-50 text-zerdeli-600',
    },
    { href: '/student/tests', label: 'Тесттер', sub: `${data.upcoming.length} белсенді`, Icon: ClipboardCheck, tint: 'bg-amber-50 text-amber-600' },
    { href: '/student/analytics', label: 'Статистика', sub: `${data.avg_score}% орташа`, Icon: BarChart3, tint: 'bg-sky-50 text-sky-600' },
    { href: '/student/catalog', label: 'Каталог', sub: 'Курс / пакет алу', Icon: ShoppingBag, tint: 'bg-violet-50 text-violet-600' },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-slate-200 bg-gradient-to-r from-brand-50 via-white to-indigo-50 p-6 sm:p-8"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="rounded-full bg-zerdeli-100 px-3 py-1 text-xs font-bold text-zerdeli-700">
              {data.preparation_direction} бағыты
            </span>
            <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">Сәлем, {name}! 👋</h1>
            <p className="mt-1 text-sm text-slate-600">
              {data.subscription
                ? `Ағымдағы пакет: ${data.subscription.plan_name}`
                : 'Бүгінгі мақсатыңа тағы бір қадам жақынсың.'}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3">
              <Flame className="h-6 w-6 text-amber-500" />
              <div>
                <div className="text-[11px] text-slate-500">Оқу лездемесі</div>
                <div className="text-base font-black text-amber-600">{data.streak_days} күн</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-zerdeli-200 bg-white px-4 py-3">
              <Gem className="h-6 w-6 text-zerdeli-600" />
              <div>
                <div className="text-[11px] text-slate-500">Жиналған балл</div>
                <div className="text-base font-black text-zerdeli-700">{data.total_points}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t, i) => (
          <motion.div key={t.href + t.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.06 }}>
            <Link
              href={t.href}
              className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${t.tint}`}>
                <t.Icon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-bold text-slate-900">{t.label}</div>
                <div className="text-xs text-slate-500">{t.sub}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Менің курстарым</h2>
            <Link href="/student/courses" className="text-xs font-semibold text-zerdeli-700 hover:underline">
              Барлығы →
            </Link>
          </div>

          {!hasCourses && (
            <EmptyBlock
              title="Әзірше белсенді курс жоқ"
              hint="Каталогтан курс немесе ҰБТ пакетін таңдап, дайындықты бастаңыз."
              action={
                <Link
                  href="/student/catalog"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-4 py-2 text-xs font-bold text-white"
                >
                  <ShoppingBag className="h-4 w-4" /> Каталогқа өту
                </Link>
              }
            />
          )}

          {data.active_courses.map((c) => (
            <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">{c.direction}</span>
                <span className="text-xs text-slate-500">
                  {c.completed_lessons} / {c.total_lessons} сабақ
                </span>
              </div>
              <h3 className="mt-3 font-bold text-slate-900">{c.title}</h3>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">Прогресс</span>
                <span className="text-zerdeli-700">{c.progress_pct}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.progress_pct}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-zerdeli-400 to-zerdeli-600"
                />
              </div>
              <Link
                href={c.next_lesson_id ? `/student/player?course=${c.id}&lesson=${c.next_lesson_id}` : `/student/player?course=${c.id}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-2.5 text-xs font-bold text-white"
              >
                <PlayCircle className="h-4 w-4" /> {c.progress_pct >= 100 ? 'Қайта қарау' : 'Сабақты жалғастыру'}
              </Link>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Жақын тапсырмалар</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-2">
            {data.upcoming.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">Белсенді тапсырма жоқ 🎉</div>
            )}
            {data.upcoming.map((d, i) => (
              <Link
                key={d.id}
                href={d.is_locked ? '/student/catalog' : `/student/test/${d.id}`}
                className={`flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50 ${i > 0 ? 'border-t border-slate-100' : ''}`}
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    d.is_locked ? 'bg-slate-100 text-slate-400' : 'bg-rose-50 text-rose-500'
                  }`}
                >
                  {d.is_locked ? <Lock className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{d.title}</div>
                  <div className="text-xs text-slate-500">
                    {d.course_title}
                    {fmtDue(d.due_at) && (
                      <>
                        {' · '}
                        <span className="font-medium text-rose-500">{fmtDue(d.due_at)}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/student/tests"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:border-zerdeli-300 hover:text-zerdeli-700"
          >
            Барлық тапсырмалар <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {data.recent_attempts.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Соңғы нәтижелер</div>
              {data.recent_attempts.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="truncate text-slate-600">{a.test_title}</span>
                  <span className={`font-bold ${a.passed ? 'text-emerald-600' : 'text-amber-600'}`}>{Math.round(a.percentage)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
