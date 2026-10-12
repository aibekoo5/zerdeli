'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useApi } from '@/lib/useApi';
import { adminAnalytics } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';

const DIR_LABEL: Record<string, string> = { UNT: 'ҰБТ', NIS: 'NIS', BIL: 'BIL', RFMSH: 'РФМШ' };

export default function AdminAnalyticsPage() {
  const { data, loading, error, reload } = useApi<any>(adminAnalytics);

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  const months = (data.months || []).map((m: any) => ({
    m: m.month.slice(5),
    revenue: Math.round(m.revenue / 1000),
    signups: m.signups,
  }));
  const totalSignups = (data.role_split || []).reduce((s: number, r: any) => s + r.count, 0) || 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Аналитика</h1>
        <p className="mt-1 text-sm text-slate-500">Платформаның нақты өсуі мен бөлінісі.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-4 text-sm font-bold text-slate-900">Айлық табыс (мың ₸)</div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={months} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="m" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={{ background: '#fff', borderColor: '#10B981', borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fill="url(#ag)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-4 text-sm font-bold text-slate-900">Айлық тіркелулер</div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="m" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} width={40} />
                <Tooltip cursor={{ fill: 'rgba(148,163,184,0.08)' }} contentStyle={{ background: '#fff', borderColor: '#10B981', borderRadius: 12 }} />
                <Bar dataKey="signups" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={40} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-5 text-sm font-bold text-slate-900">Курс бағыттары бойынша үлес</div>
        <div className="space-y-4">
          {(data.direction_split || []).map((b: any) => {
            const total = (data.direction_split || []).reduce((s: number, x: any) => s + x.count, 0) || 1;
            const pct = Math.round((b.count / total) * 100);
            return (
              <div key={b.direction}>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">{DIR_LABEL[b.direction] || b.direction}</span>
                  <span className="text-zerdeli-700">{pct}% ({b.count})</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-zerdeli-400 to-zerdeli-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
