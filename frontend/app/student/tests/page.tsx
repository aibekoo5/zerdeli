'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ClipboardCheck, FileText, Clock, CheckCircle2, ArrowRight, Lock, Trophy } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { getTests, getMyAttempts } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';

const tabs = ['Белсенді', 'Тапсырылған'] as const;

const KIND_LABEL: Record<string, string> = {
  mock: 'ҰБТ байқау сынағы',
  topic: 'Тақырыптық тест',
  section: 'Бөлім тесті',
  practice: 'Практикалық тест',
  homework: 'Үй жұмысы',
  quiz: 'Quiz',
  trial: 'Сынақ тест',
  monthly: 'Айлық тест',
  final: 'Қорытынды тест',
};

function fmtDue(iso?: string | null) {
  if (!iso) return null;
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
  if (days <= 0) return 'Бүгін';
  if (days === 1) return 'Ертең';
  return `${days} күн`;
}

export default function StudentTestsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Белсенді');
  const tests = useApi(() => getTests());
  const attempts = useApi(getMyAttempts);

  const loading = tests.loading || attempts.loading;
  const error = tests.error || attempts.error;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Тесттер мен үй тапсырмалары</h1>
        <p className="mt-1 text-sm text-slate-500">Барлық сынақтар мен нәтижелерің бір жерде.</p>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold sm:w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-4 py-2 transition-colors sm:flex-none ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={() => { tests.reload(); attempts.reload(); }} />}

      {!loading && !error && tab === 'Белсенді' && (
        <div className="space-y-3">
          {(tests.data || []).map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    a.is_locked ? 'bg-slate-100 text-slate-400' : a.kind === 'mock' ? 'bg-zerdeli-50 text-zerdeli-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {a.is_locked ? <Lock className="h-5 w-5" /> : a.kind === 'mock' ? <Trophy className="h-5 w-5" /> : <ClipboardCheck className="h-5 w-5" />}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {KIND_LABEL[a.kind] || 'Тест'}
                    </span>
                    <span className="text-xs text-slate-500">{a.course_title}</span>
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{a.title}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" /> {a.duration_minutes} мин · {a.total_questions} сұрақ
                    {fmtDue(a.due_at) && <span className="text-rose-500">· {fmtDue(a.due_at)}</span>}
                    {a.attempts_count > 0 && (
                      <span className="text-emerald-600">· үздік {Math.round(a.best_percentage || 0)}%</span>
                    )}
                  </div>
                </div>
              </div>
              {a.is_locked ? (
                <Link
                  href="/student/catalog"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:border-zerdeli-300 hover:text-zerdeli-700"
                >
                  <Lock className="h-3.5 w-3.5" /> Ашу үшін сатып алу
                </Link>
              ) : (
                <Link
                  href={`/student/test/${a.id}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-5 py-2.5 text-xs font-bold text-white"
                >
                  {a.attempts_count > 0 ? 'Қайта тапсыру' : 'Бастау'} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </motion.div>
          ))}
          {tests.data && tests.data.length === 0 && (
            <EmptyBlock title="Қолжетімді тест жоқ" hint="Курс немесе ҰБТ пакетін сатып алғанда сынақтар осында пайда болады." />
          )}
        </div>
      )}

      {!loading && !error && tab === 'Тапсырылған' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-2">
          {(attempts.data || []).length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">Әзірше тапсырылған тест жоқ</div>
          )}
          {(attempts.data || []).map((d, i) => (
            <Link
              key={d.id}
              href={`/student/test/${d.test_id}`}
              className={`flex items-center justify-between gap-3 p-4 transition-colors hover:bg-slate-50 ${i > 0 ? 'border-t border-slate-100' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    d.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{d.test_title}</div>
                  <div className="text-xs text-slate-500">
                    {d.completed_at ? new Date(d.completed_at).toLocaleDateString('ru') : ''}
                  </div>
                </div>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  d.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}
              >
                {Math.round(d.percentage)}%
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
