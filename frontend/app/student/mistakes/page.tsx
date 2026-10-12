'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle2, ChevronDown, AlertTriangle } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { getMyMistakes, MistakeItem } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';

function MistakeRow({ m }: { m: MistakeItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-3 p-4 text-left">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <XCircle className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-900">{m.question_text}</div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
              {m.test_title}
              {m.times_wrong >= 2 && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  {m.times_wrong}× қайталанды
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-3 border-t border-slate-100 p-4 text-xs">
              {m.options.length > 0 && (
                <div className="space-y-1.5">
                  {m.options.map((o) => (
                    <div
                      key={o.id}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                        o.is_correct ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {o.is_correct ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <span className="h-3.5 w-3.5" />}
                      {o.text}
                    </div>
                  ))}
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-rose-50 p-2.5">
                  <span className="font-bold text-rose-700">Сенің жауабың:</span>{' '}
                  <span className="text-rose-800">{m.your_answer} ❌</span>
                </div>
                <div className="rounded-lg bg-emerald-50 p-2.5">
                  <span className="font-bold text-emerald-700">Дұрыс жауап:</span>{' '}
                  <span className="text-emerald-800">{m.correct_answer} ✅</span>
                </div>
              </div>
              {m.explanation && (
                <div className="rounded-lg border border-zerdeli-100 bg-zerdeli-50/40 p-3 leading-relaxed text-slate-700">
                  💡 <span className="font-semibold">Түсіндірме:</span> {m.explanation}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StudentMistakesPage() {
  const { data, loading, error, reload } = useApi(getMyMistakes);
  const [active, setActive] = useState<string | null>(null);

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  if (data.total_mistakes === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Қателермен жұмыс</h1>
          <p className="mt-1 text-sm text-slate-500">Тесттердегі қателерің осында жиналады.</p>
        </div>
        <EmptyBlock title="Қате жоқ 🎉" hint="Тест тапсырғанда қате жіберсең, ол осында топталып тұрады — қайталап оқуға ыңғайлы." />
      </div>
    );
  }

  const group = data.groups.find((g) => g.subject === active) || data.groups[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Менің қателерім</h1>
        <p className="mt-1 text-sm text-slate-500">
          Барлығы {data.total_mistakes} қате · {data.repeated} қайталанған
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.groups.map((g) => (
          <button
            key={g.subject}
            onClick={() => setActive(g.subject)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              g.subject === group.subject ? 'border-zerdeli-400 bg-zerdeli-50/40 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="text-sm font-bold text-slate-900">{g.subject}</div>
            <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-bold">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{g.total} қате</span>
              {g.repeated > 0 && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">{g.repeated} қайталанған</span>}
              {g.fresh > 0 && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">{g.fresh} жаңа</span>}
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> {group.subject} — қателерді талдау
        </div>
        {group.items.map((m) => (
          <MistakeRow key={m.question_id} m={m} />
        ))}
      </div>
    </div>
  );
}
