'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useApi } from '@/lib/useApi';
import { curatorDashboard } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';
import { ago } from '@/components/curator/shared';

export default function CuratorReportsPage() {
  const { data, loading, error, reload } = useApi(curatorDashboard);

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  const avgProgress =
    data.students.length > 0
      ? Math.round(data.students.reduce((s, x) => s + x.progress_pct, 0) / data.students.length)
      : 0;
  const withHw = data.students.filter((s) => s.unfinished_homework > 0).length;

  const rows = [
    { label: 'Барлық оқушы', value: data.total_students },
    { label: 'Бүгін жүйеге кірген', value: `${data.active_today} / ${data.total_students}` },
    { label: 'Орташа прогресс', value: `${avgProgress}%` },
    { label: 'Орындалмаған ҮЖ бар оқушылар', value: withHw },
    { label: 'Назар аударуды қажет етеді', value: data.needs_attention },
    { label: 'Белсенді емес', value: data.inactive },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Апталық есеп</h1>
        <p className="mt-1 text-sm text-slate-500">Топтың жалпы көрсеткіштері.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="text-xs font-semibold text-slate-500">{r.label}</div>
            <div className="mt-1 text-2xl font-black text-slate-900">{r.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-4 text-sm font-bold text-slate-900">Оқушылар кестесі</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr className="border-b border-slate-100">
                <th className="p-4 font-semibold">Оқушы</th>
                <th className="p-4 font-semibold">Прогресс</th>
                <th className="p-4 font-semibold">Соңғы кіру</th>
                <th className="p-4 font-semibold">Орындалмаған ҮЖ</th>
                <th className="p-4 font-semibold">Орташа балл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900">{s.full_name}</td>
                  <td className="p-4 text-slate-500">{s.progress_pct}%</td>
                  <td className="p-4 text-slate-500">{ago(s.last_login_at)}</td>
                  <td className="p-4 font-bold text-slate-900">{s.unfinished_homework}</td>
                  <td className="p-4 text-slate-500">{s.avg_score != null ? `${Math.round(s.avg_score)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
