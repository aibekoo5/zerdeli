'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Users, Activity, AlertTriangle, MoonStar, ArrowRight } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { curatorDashboard } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';
import { StudentCard } from '@/components/curator/shared';

export default function CuratorDashboardPage() {
  const { user } = useAuth();
  const name = user?.full_name?.split(' ')[0] || 'Куратор';
  const { data, loading, error, reload } = useApi(curatorDashboard);

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  const kpi = [
    { label: 'Менің оқушыларым', value: data.total_students, Icon: Users, tint: 'bg-teal-50 text-teal-600' },
    { label: 'Бүгін белсенді', value: data.active_today, Icon: Activity, tint: 'bg-emerald-50 text-emerald-600' },
    { label: 'Назар аударуды қажет етеді', value: data.needs_attention, Icon: AlertTriangle, tint: 'bg-amber-50 text-amber-600' },
    { label: 'Белсенді емес', value: data.inactive, Icon: MoonStar, tint: 'bg-rose-50 text-rose-600' },
  ];

  const priority = data.students.filter((s) => s.status !== 'ok').slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Сәлем, {name}! 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Бекітілген оқушыларыңыздың оқу барысы.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpi.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <span className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${k.tint}`}>
              <k.Icon className="h-4 w-4" />
            </span>
            <div className="text-2xl font-black text-slate-900">{k.value}</div>
            <div className="text-[11px] text-slate-500">{k.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Назар аударуды қажет ететін оқушылар</h2>
          </div>
          <Link href="/curator/students" className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline">
            Барлығы <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {priority.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
            Барлық оқушы жоспар бойынша жүр 👍
          </div>
        )}
        {priority.map((s) => (
          <StudentCard key={s.id} s={s} />
        ))}
      </div>
    </div>
  );
}
