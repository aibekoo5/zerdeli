'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clock, TrendingUp } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { teacherAnalytics, teacherCourses } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';

export default function TeacherAnalyticsPage() {
  const analytics = useApi<any>(teacherAnalytics);
  const courses = useApi<any[]>(teacherCourses);

  if (analytics.loading) return <LoadingBlock />;
  if (analytics.error || !analytics.data) return <ErrorBlock message={analytics.error} onRetry={analytics.reload} />;
  const a = analytics.data;

  const perf = [
    { label: 'Орташа тест балы', value: `${a.average_test_score}%`, tint: 'text-amber-600' },
    { label: 'Курсты аяқтау', value: `${a.course_completion_rate}%`, tint: 'text-emerald-600' },
    { label: 'Белсенді оқушылар', value: a.total_students, tint: 'text-zerdeli-700' },
    { label: 'Жалпы табыс', value: `${Number(a.monthly_revenue_kzt).toLocaleString('ru')} ₸`, tint: 'text-slate-900' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Статистика &amp; қаржы</h1>
        <p className="mt-1 text-sm text-slate-500">Оқыту сапасы мен табыс есебі.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {perf.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="text-xs font-semibold text-slate-500">{p.label}</div>
            <div className={`mt-1 text-2xl font-black ${p.tint}`}>{p.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
            <TrendingUp className="h-4 w-4 text-zerdeli-600" /> Курстар бойынша табыс
          </div>
          <div className="space-y-3">
            {(courses.data || []).map((c) => {
              const max = Math.max(...(courses.data || []).map((x: any) => x.revenue), 1);
              return (
                <div key={c.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-slate-600">{c.title}</span>
                    <span className="font-bold text-zerdeli-700">{Number(c.revenue).toLocaleString('ru')} ₸</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-zerdeli-400 to-zerdeli-600" style={{ width: `${(c.revenue / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
            {courses.data && courses.data.length === 0 && <div className="text-xs text-slate-400">Курс жоқ</div>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-zerdeli-500 to-zerdeli-600 p-6 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
            <Wallet className="h-4 w-4" /> Жинақталған табыс
          </div>
          <div className="mt-2 text-3xl font-black">{Number(a.monthly_revenue_kzt).toLocaleString('ru')} ₸</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
            <Clock className="h-3.5 w-3.5" /> Келесі төлем: 05.10.2026
          </div>
        </div>
      </div>
    </div>
  );
}
