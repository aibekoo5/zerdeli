'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Users, BookOpen, ClipboardCheck, Wallet, ArrowRight, Radio } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { teacherStats, teacherCourses, teacherHomework, teacherSchedule } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const name = user?.full_name?.split(' ')[0] || 'Ұстаз';

  const stats = useApi<any>(teacherStats);
  const courses = useApi<any[]>(teacherCourses);
  const homework = useApi<any[]>(teacherHomework);
  const schedule = useApi<any[]>(teacherSchedule);

  if (stats.loading) return <LoadingBlock />;
  if (stats.error || !stats.data) return <ErrorBlock message={stats.error} onRetry={stats.reload} />;
  const s = stats.data;

  const cards = [
    { label: 'Белсенді оқушылар', value: s.active_students, tint: 'text-zerdeli-700' },
    { label: 'Ағымдағы курстар', value: s.total_courses, tint: 'text-slate-900' },
    { label: 'Орташа тест балы', value: `${s.average_test_score}%`, tint: 'text-amber-600' },
    { label: 'Айлық табыс', value: `${Number(s.monthly_revenue_kzt).toLocaleString('ru')} ₸`, tint: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Сәлеметсіз бе, {name}! 👋</h1>
          <p className="mt-1 text-sm text-slate-500">Курстарыңыз бен оқушылар нәтижесінің қысқаша шолуы.</p>
        </div>
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-zerdeli-500/25"
        >
          <BookOpen className="h-4 w-4" /> Курстарым
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="text-xs font-semibold text-slate-500">{c.label}</div>
            <div className={`mt-1 text-2xl font-black ${c.tint}`}>{c.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Менің курстарым</h2>
            <Link href="/teacher/courses" className="text-xs font-semibold text-zerdeli-700 hover:underline">
              Барлығы →
            </Link>
          </div>
          {(courses.data || []).map((c) => (
            <Link
              key={c.id}
              href={`/teacher/courses/${c.id}`}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-zerdeli-300"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zerdeli-100 text-xs font-bold text-zerdeli-700">
                  {c.direction}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{c.title}</div>
                  <div className="text-xs text-slate-500">
                    {c.students_count} оқушы · {c.modules_count} бөлім · {c.lessons_count} сабақ · {Number(c.revenue).toLocaleString('ru')} ₸
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {courses.data && courses.data.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
              Әзірше курс жоқ
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Соңғы тапсырылған тесттер</h2>
          <div className="space-y-2">
            {(homework.data || []).slice(0, 5).map((h) => (
              <div key={h.attempt_id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <ClipboardCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{h.student_name}</div>
                    <div className="text-xs text-slate-500">{h.test_title}</div>
                  </div>
                </div>
                <span className={`text-xs font-bold ${h.passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {Math.round(h.percentage)}%
                </span>
              </div>
            ))}
            {homework.data && homework.data.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-400">Тапсырылған тест жоқ</div>
            )}
          </div>

          {(schedule.data || []).slice(0, 1).map((ev) => (
            <Link
              key={ev.id}
              href="/teacher/schedule"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 p-5 text-white"
            >
              <div className="flex items-center gap-3">
                <Radio className="h-6 w-6" />
                <div>
                  <div className="font-bold">{ev.title}</div>
                  <div className="text-sm text-white/80">{new Date(ev.starts_at).toLocaleString('ru')}</div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
