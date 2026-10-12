'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Phone, Mail, Send, Loader2, CheckCircle2, CalendarClock, XCircle,
} from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { curatorStudent, curatorSendMessage } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';
import { STATUS, ago } from '@/components/curator/shared';

export default function CuratorStudentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { data, loading, error, reload } = useApi(() => curatorStudent(id), [id]);

  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  const s = data.student;
  const st = STATUS[s.status] || STATUS.ok;

  const send = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await curatorSendMessage(id, msg.trim());
      setMsg('');
      setSent(true);
      setTimeout(() => setSent(false), 2500);
      reload();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/curator/students" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-teal-700">
        <ChevronLeft className="h-4 w-4" /> Оқушылар
      </Link>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-xl font-black text-white">
            {s.full_name.charAt(0)}
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{s.full_name}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>{s.direction}</span>
              {s.phone && (
                <a href={`tel:${s.phone}`} className="flex items-center gap-1 hover:text-teal-700">
                  <Phone className="h-3 w-3" /> {s.phone}
                </a>
              )}
              <a href={`mailto:${s.email}`} className="flex items-center gap-1 hover:text-teal-700">
                <Mail className="h-3 w-3" /> {s.email}
              </a>
            </div>
          </div>
        </div>
        <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${st.tint}`}>{st.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Прогресс', value: `${s.progress_pct}%` },
          { label: 'Соңғы кіру', value: ago(s.last_login_at) },
          { label: 'Соңғы сабақ', value: ago(s.last_lesson_at) },
          { label: 'Орындалмаған ҮЖ', value: s.unfinished_homework },
        ].map((x) => (
          <div key={x.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-[11px] font-semibold text-slate-500">{x.label}</div>
            <div className="mt-1 text-lg font-black text-slate-900">{x.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <div>
            <h2 className="mb-3 text-sm font-bold text-slate-900">Курстар</h2>
            <div className="space-y-2">
              {data.courses.map((c: any) => (
                <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-900">{c.title}</span>
                    <span className="text-xs font-bold text-teal-700">{c.progress_pct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-600" style={{ width: `${c.progress_pct}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">{c.completed_lessons}/{c.total_lessons} сабақ</div>
                </div>
              ))}
              {data.courses.length === 0 && <div className="text-xs text-slate-400">Курс жоқ</div>}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-bold text-slate-900">Соңғы тест нәтижелері</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-2">
              {data.attempts.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-3 text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    {a.passed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                    {a.test_title}
                  </span>
                  <span className={`font-bold ${a.passed ? 'text-emerald-600' : 'text-amber-600'}`}>{Math.round(a.percentage)}%</span>
                </div>
              ))}
              {data.attempts.length === 0 && <div className="p-3 text-xs text-slate-400">Тест тапсырмаған</div>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <Send className="h-4 w-4 text-teal-600" /> Хабарлама жіберу
            </div>
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={4}
              placeholder="Оқушыға жеке хабарлама жаз..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:border-teal-500 focus:outline-none"
            />
            <button
              onClick={send}
              disabled={sending || !msg.trim()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : sent ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {sent ? 'Жіберілді' : 'Жіберу'}
            </button>
            <div className="mt-2 text-[11px] text-slate-400">Барлығы {data.notifications_sent} хабарлама жіберілген</div>
          </div>

          {data.upcoming.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Орындалмаған тапсырмалар</div>
              {data.upcoming.map((u: any) => (
                <div key={u.id} className="flex items-center gap-2 py-1.5 text-xs text-slate-600">
                  <CalendarClock className="h-3.5 w-3.5 text-rose-400" /> {u.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
