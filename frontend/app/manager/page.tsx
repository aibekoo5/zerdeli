'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Phone, Wallet, Target, ArrowRight, UserPlus } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { managerDashboard } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';

export default function ManagerDashboardPage() {
  const { user } = useAuth();
  const name = user?.full_name?.split(' ')[0] || 'Менеджер';
  const { data, loading, error, reload } = useApi<any>(managerDashboard);

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  const kpi = [
    { label: 'Жаңа лидтер (бүгін)', value: data.new_leads, sub: `${data.unprocessed_leads} өңделмеген`, tint: 'text-slate-900' },
    { label: 'Айлық сатылым', value: `${Number(data.sales_this_month).toLocaleString('ru')} ₸`, sub: 'аяқталған төлемдер', tint: 'text-emerald-600' },
    { label: 'Конверсия (лид→оқушы)', value: `${data.conversion_pct}%`, sub: 'барлық лидтер бойынша', tint: 'text-zerdeli-700' },
    { label: 'Қарызы бар оқушылар', value: data.debtors, sub: `${Number(data.debt_amount).toLocaleString('ru')} ₸`, tint: 'text-rose-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Сәлем, {name}! 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Лидтер, төлемдер және сату көрсеткіштері.</p>
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
            <div className="text-xs font-semibold text-slate-500">{k.label}</div>
            <div className={`mt-1 text-2xl font-black ${k.tint}`}>{k.value}</div>
            <div className="mt-1 text-[11px] text-slate-500">{k.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-zerdeli-600" />
            <h2 className="text-lg font-bold text-slate-900">Сату воронкасы</h2>
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
            {(data.funnel || []).map((f: any, i: number) => {
              const max = Math.max(...(data.funnel || []).map((x: any) => x.value), 1);
              return (
                <div key={f.label}>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600">{f.label}</span>
                    <span className="text-zerdeli-700">{f.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(f.value / max) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08 }}
                      className="h-full rounded-full bg-gradient-to-r from-zerdeli-400 to-zerdeli-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">Жылдам сілтемелер</h2>
          <div className="grid gap-3">
            {[
              { label: 'Лидтер тақтасы', href: '/manager/leads', Icon: UserPlus },
              { label: 'Төлемдер & қарыздар', href: '/manager/payments', Icon: Wallet },
              { label: 'Сынақ сабақтар', href: '/manager/trials', Icon: Phone },
            ].map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-zerdeli-300"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zerdeli-50 text-zerdeli-600">
                    <q.Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-bold text-slate-900">{q.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
