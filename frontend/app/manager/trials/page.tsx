'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle2, Phone, Video } from 'lucide-react';
import { managerTrials, managerUpdateTrial } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';

const tabs = ['Жоспарланған', 'Өткізілген'] as const;
const resultTint: Record<string, string> = {
  enrolled: 'bg-emerald-50 text-emerald-700',
  thinking: 'bg-amber-50 text-amber-700',
  declined: 'bg-rose-50 text-rose-700',
};
const resultLabel: Record<string, string> = { enrolled: 'Курсқа жазылды', thinking: 'Ойланып жатыр', declined: 'Бас тартты' };

interface Trial {
  id: string;
  student_name: string;
  phone: string;
  subject: string;
  teacher_name?: string;
  scheduled_at: string;
  status: string;
  result?: string;
  confirmed: boolean;
}

export default function ManagerTrialsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Жоспарланған');
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    managerTrials()
      .then((d) => setTrials(d as Trial[]))
      .catch((e) => setError(e?.response?.data?.detail || 'Жүктелмеді'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const confirm = async (id: string) => {
    setTrials((p) => p.map((t) => (t.id === id ? { ...t, confirmed: true } : t)));
    try {
      await managerUpdateTrial(id, { confirmed: true });
    } catch {
      load();
    }
  };
  const setResult = async (id: string, result: string) => {
    setTrials((p) => p.map((t) => (t.id === id ? { ...t, status: 'done', result } : t)));
    try {
      await managerUpdateTrial(id, { status: 'done', result });
    } catch {
      load();
    }
  };

  const planned = trials.filter((t) => t.status === 'planned');
  const past = trials.filter((t) => t.status === 'done');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Сынақ сабақтар</h1>
        <p className="mt-1 text-sm text-slate-500">Тегін сынақ сабақтарды жоспарлау және нәтижесін тіркеу.</p>
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
      {error && <ErrorBlock message={error} onRetry={load} />}

      {!loading && !error && tab === 'Жоспарланған' && (
        <div className="space-y-3">
          {planned.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <CalendarClock className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">{p.student_name}</div>
                  <div className="text-xs text-slate-500">
                    {p.subject} · {p.teacher_name || 'ұстаз тағайындалмаған'} · {new Date(p.scheduled_at).toLocaleString('ru')}
                  </div>
                  <div className="mt-1">
                    {p.confirmed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Расталған
                      </span>
                    ) : (
                      <button
                        onClick={() => confirm(p.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200"
                      >
                        Растау
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.phone && (
                  <a href={`tel:${p.phone}`} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">
                    <Phone className="h-3.5 w-3.5" /> Қоңырау
                  </a>
                )}
                <button onClick={() => setResult(p.id, 'enrolled')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                  Жазылды
                </button>
                <button onClick={() => setResult(p.id, 'thinking')} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white">
                  Ойлануда
                </button>
                <button onClick={() => setResult(p.id, 'declined')} className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-bold text-white">
                  Бас тартты
                </button>
              </div>
            </motion.div>
          ))}
          {planned.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-400">Жоспарланған сабақ жоқ</div>}
        </div>
      )}

      {!loading && !error && tab === 'Өткізілген' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-2">
          {past.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between gap-3 p-4 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Video className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{p.student_name}</div>
                  <div className="text-xs text-slate-500">
                    {p.subject} · {new Date(p.scheduled_at).toLocaleDateString('ru')}
                  </div>
                </div>
              </div>
              {p.result && (
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${resultTint[p.result] || 'bg-slate-100 text-slate-600'}`}>
                  {resultLabel[p.result] || p.result}
                </span>
              )}
            </div>
          ))}
          {past.length === 0 && <div className="p-6 text-center text-xs text-slate-400">Өткізілген сабақ жоқ</div>}
        </div>
      )}
    </div>
  );
}
