'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { CreditCard, CheckCircle2, Clock, Wallet, Sparkles } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { getMyAnalytics, getMyPayments, getMySubscription, getMyAchievements } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';

export default function StudentAnalyticsPage() {
  const analytics = useApi(getMyAnalytics);
  const payments = useApi(getMyPayments);
  const sub = useApi(getMySubscription);
  const achievements = useApi(getMyAchievements);

  if (analytics.loading) return <LoadingBlock />;
  if (analytics.error || !analytics.data) return <ErrorBlock message={analytics.error} onRetry={analytics.reload} />;

  const a = analytics.data;
  const summary = [
    { label: 'Жалпы прогресс', value: `${a.overall_progress_percentage}%`, sub: `${a.completed_lessons}/${a.total_lessons} сабақ`, tint: 'text-zerdeli-700' },
    { label: 'Орташа тест балы', value: `${a.average_test_score}%`, sub: `${a.tests_taken} тест тапсырылды`, tint: 'text-amber-600' },
    { label: 'Оқу лездемесі', value: `${a.streak_days} күн 🔥`, sub: 'қатарынан', tint: 'text-rose-500' },
    { label: 'Жиналған балл', value: `${a.total_points}`, sub: 'рейтинг ұпайы', tint: 'text-emerald-600' },
  ];

  const subEnd = sub.data?.end_date ? new Date(sub.data.end_date).toLocaleDateString('ru') : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Статистика &amp; қаржы</h1>
        <p className="mt-1 text-sm text-slate-500">Оқу белсенділігі, нәтижелер және төлемдер тарихы.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s, i) => (
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

      <AnalyticsCharts
        weekly={a.weekly_activity}
        radar={a.subject_mastery.map((m) => ({ subject: m.subject, score: m.score }))}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-zerdeli-500 to-zerdeli-600 p-6 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
            <Wallet className="h-4 w-4" /> Ағымдағы пакет
          </div>
          {sub.data ? (
            <>
              <div className="mt-2 text-xl font-black">{sub.data.plan_name}</div>
              <div className="mt-1 text-sm text-white/80">Аяқталады: {subEnd}</div>
            </>
          ) : (
            <>
              <div className="mt-2 text-xl font-black">Белсенді пакет жоқ</div>
              <div className="mt-1 text-sm text-white/80">ҰБТ пакетін алып, барлық курсты ашыңыз</div>
            </>
          )}
          <Link
            href="/student/catalog"
            className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-xs font-bold text-zerdeli-700"
          >
            {sub.data ? 'Пакетті ұзарту' : 'Пакет таңдау'}
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-2">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">Төлемдер тарихы</h2>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </div>
          {payments.loading && <div className="p-4 text-center text-xs text-slate-400">Жүктелуде…</div>}
          {payments.data && payments.data.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">Төлемдер жоқ</div>
          )}
          {(payments.data || []).map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${i > 0 ? 'border-t border-slate-100' : ''}`}
            >
              <div className="min-w-0">
                <div className="truncate font-semibold text-slate-900">{p.item_title}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="h-3 w-3" /> {new Date(p.created_at).toLocaleDateString('ru')} · {p.payment_method}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{p.amount.toLocaleString('ru')} ₸</span>
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" /> {p.status === 'completed' ? 'Төленді' : p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {achievements.data && achievements.data.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Жетістіктер</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.data.map((b) => (
              <div
                key={b.id}
                className={`space-y-2 rounded-2xl border p-5 ${
                  b.is_unlocked ? 'border-zerdeli-200 bg-white' : 'border-slate-200 bg-slate-50 opacity-60'
                }`}
              >
                <span className="text-3xl">{b.icon}</span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                  {b.title}
                  {b.is_unlocked && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                </div>
                <p className="text-xs text-slate-600">{b.description}</p>
                <span className="inline-block rounded-full bg-zerdeli-50 px-2.5 py-0.5 text-[10px] font-bold text-zerdeli-700">
                  +{b.points_reward} балл
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
