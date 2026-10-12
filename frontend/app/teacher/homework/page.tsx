'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { teacherHomework } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';

export default function TeacherHomeworkPage() {
  const { data, loading, error, reload } = useApi<any[]>(teacherHomework);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Үй жұмыстары мен тесттер</h1>
        <p className="mt-1 text-sm text-slate-500">Курстарыңыз бойынша соңғы тапсырылған сынақтар (автоматты тексерілді).</p>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyBlock title="Тапсырылған тест жоқ" hint="Оқушылар сынақ тапсырғанда осында пайда болады." />}

      {data && data.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-2">
          {data.map((g, i) => (
            <motion.div
              key={g.attempt_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className={`flex items-center justify-between gap-3 p-4 ${i > 0 ? 'border-t border-slate-100' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    g.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {g.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{g.student_name}</div>
                  <div className="text-xs text-slate-500">
                    {g.test_title} · {g.completed_at ? new Date(g.completed_at).toLocaleString('ru') : ''}
                  </div>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${g.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                {Math.round(g.percentage)}%
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
