'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Wallet, ClipboardCheck, GraduationCap, BookOpen, BarChart3 } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { adminMetrics } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';

export default function AdminDashboardPage() {
  const { data, loading, error, reload } = useApi<any>(adminMetrics);

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  const stats = [
    { label: 'Барлық пайдаланушы', value: data.total_users, sub: `${data.students} оқушы · ${data.teachers} ұстаз · ${data.curators || 0} куратор`, tint: 'text-slate-900' },
    { label: 'Белсенді жазылымдар', value: data.active_subscriptions, sub: 'ҰБТ пакеттері', tint: 'text-zerdeli-700' },
    { label: 'Жалпы түсім', value: `${Number(data.total_revenue_kzt).toLocaleString('ru')} ₸`, sub: `осы айда ${Number(data.revenue_this_month_kzt).toLocaleString('ru')} ₸`, tint: 'text-emerald-600' },
    { label: 'Орындалған тесттер', value: data.completed_tests, sub: 'автоматты тексерілді', tint: 'text-amber-600' },
  ];

  const quick = [
    { label: 'Пайдаланушылар', href: '/admin/users', Icon: Users },
    { label: 'Курстар', href: '/admin/courses', Icon: BookOpen },
    { label: 'Мұғалімдер', href: '/admin/teachers', Icon: GraduationCap },
    { label: 'Қаржы', href: '/admin/finance', Icon: Wallet },
    { label: 'Аналитика', href: '/admin/analytics', Icon: BarChart3 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Әкімші панелі</h1>
        <p className="mt-1 text-sm text-slate-500">Платформаның нақты көрсеткіштері.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="text-xs font-semibold text-slate-500">{s.label}</div>
            <div className={`mt-1 text-2xl font-black ${s.tint}`}>{s.value}</div>
            <div className="mt-1 text-[11px] text-slate-500">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-slate-900">Жылдам сілтемелер</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {quick.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zerdeli-50 text-zerdeli-600">
                <q.Icon className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold text-slate-900">{q.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
