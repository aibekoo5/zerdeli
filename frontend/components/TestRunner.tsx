'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Trophy, HelpCircle, XCircle, ChevronLeft, Loader2,
} from 'lucide-react';
import { Test, TestAttemptResult, AnswerInput, submitTest } from '@/lib/api';

type Answer = { selected: string[]; numerical?: string };

export function TestRunner({ test }: { test: Test }) {
  const [phase, setPhase] = useState<'intro' | 'running' | 'result'>('intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [timeLeft, setTimeLeft] = useState(test.duration_minutes * 60);
  const [result, setResult] = useState<TestAttemptResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [onlyWrong, setOnlyWrong] = useState(false);

  const q = test.questions[idx];

  const submit = useMemo(
    () => async () => {
      if (busy) return;
      setBusy(true);
      setError('');
      const payload: AnswerInput[] = test.questions.map((qq) => ({
        question_id: qq.id,
        selected_option_ids: answers[qq.id]?.selected || [],
        numerical_answer: answers[qq.id]?.numerical || null,
      }));
      try {
        const res = await submitTest(test.id, payload);
        setResult(res);
        setPhase('result');
      } catch (e: unknown) {
        const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        setError(String(d || 'Жіберу мүмкін болмады'));
      } finally {
        setBusy(false);
      }
    },
    [answers, busy, test],
  );

  useEffect(() => {
    if (phase !== 'running') return;
    if (timeLeft <= 0) {
      submit();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, submit]);

  const start = () => {
    setAnswers({});
    setIdx(0);
    setTimeLeft(test.duration_minutes * 60);
    setResult(null);
    setOnlyWrong(false);
    setPhase('running');
  };

  const pick = (optId: string) => {
    setAnswers((p) => {
      const cur = p[q.id]?.selected || [];
      if (q.question_type === 'multiple_choice') {
        const next = cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId];
        return { ...p, [q.id]: { selected: next } };
      }
      return { ...p, [q.id]: { selected: [optId] } };
    });
  };
  const setNum = (v: string) => setAnswers((p) => ({ ...p, [q.id]: { selected: [], numerical: v } }));

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  /* -------- INTRO -------- */
  if (phase === 'intro') {
    return (
      <Shell>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-zerdeli-500 to-emerald-400 text-white">
            <Trophy className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-2xl font-black text-slate-900 sm:text-3xl">{test.title}</h1>
          {test.description && <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">{test.description}</p>}
          <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3 text-xs">
            <Info label="Сұрақтар" value={`${test.questions.length}`} />
            <Info label="Уақыты" value={`${test.duration_minutes} мин`} />
            <Info label="Өту балы" value={`${test.passing_score}%`} />
          </div>
          <button
            onClick={start}
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-zerdeli-500/25"
          >
            Сынақты бастау <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </Shell>
    );
  }

  /* -------- RESULT -------- */
  if (phase === 'result' && result) {
    const correct = result.answers.filter((a) => a.is_correct).length;
    const wrong = result.answers.length - correct;
    const shown = onlyWrong ? result.answers.filter((a) => !a.is_correct) : result.answers;
    return (
      <Shell>
        <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="text-center">
            <span
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-white ${
                result.passed ? 'bg-gradient-to-tr from-emerald-500 to-emerald-400' : 'bg-gradient-to-tr from-amber-500 to-amber-400'
              }`}
            >
              <Trophy className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-2xl font-black text-slate-900">
              {result.passed ? 'Құттықтаймыз! 🎉' : 'Сынақ аяқталды'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {result.passed ? 'Нәтижеңіз өту шегінен жоғары.' : 'Қатемен жұмыс жасап, қайта тапсырыңыз.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <Info label={`${result.answers.length} сұрақ`} value={`${Math.round(result.percentage)}%`} />
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="text-emerald-600">Дұрыс</div>
              <div className="mt-0.5 text-sm font-black text-emerald-700">{correct}</div>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
              <div className="text-rose-600">Қате</div>
              <div className="mt-0.5 text-sm font-black text-rose-700">{wrong}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                <HelpCircle className="h-4 w-4 text-zerdeli-500" /> Талдау
              </div>
              {wrong > 0 && (
                <button
                  onClick={() => setOnlyWrong((v) => !v)}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-bold ${
                    onlyWrong ? 'bg-rose-600 text-white' : 'border border-slate-200 text-slate-600'
                  }`}
                >
                  {onlyWrong ? 'Барлығын көрсету' : 'Қателерді талдау'}
                </button>
              )}
            </div>
            {shown.map((a) => {
              const num = result.answers.indexOf(a) + 1;
              return (
                <div key={a.question_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
                  <div className="flex items-start gap-2 font-bold text-slate-900">
                    {a.is_correct ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    )}
                    <span>{num}. {a.question_text}</span>
                  </div>
                  {a.explanation && (
                    <div className="mt-2 rounded-xl border border-zerdeli-100 bg-white p-2.5 leading-relaxed text-slate-600">
                      💡 {a.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-center">
            <button
              onClick={start}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-xs font-bold text-slate-700 hover:border-zerdeli-300"
            >
              <RefreshCw className="h-4 w-4" /> Қайта тапсыру
            </button>
            <Link
              href="/student/tests"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-6 py-3 text-xs font-bold text-white"
            >
              Тесттерге оралу
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  /* -------- RUNNING -------- */
  return (
    <Shell>
      <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="flex h-8 items-center rounded-xl bg-zerdeli-50 px-3 text-xs font-bold text-zerdeli-700">
            {idx + 1} / {test.questions.length}
          </span>
          <span className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 font-mono text-sm font-bold text-slate-700">
            <Clock className="h-4 w-4" /> {fmt(timeLeft)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {test.questions.map((qq, i) => {
            const answered = (answers[qq.id]?.selected?.length || 0) > 0 || !!answers[qq.id]?.numerical;
            return (
              <button
                key={qq.id}
                onClick={() => setIdx(i)}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors ${
                  i === idx ? 'bg-zerdeli-500 text-white' : answered ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold leading-relaxed text-slate-900">{q.question_text}</h3>

          {q.question_type === 'numerical' ? (
            <input
              value={answers[q.id]?.numerical || ''}
              onChange={(e) => setNum(e.target.value)}
              placeholder="Сандық жауап (мыс. 5)"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base font-bold text-slate-900 focus:border-zerdeli-500 focus:outline-none"
            />
          ) : (
            <div className="space-y-2.5">
              {q.options.map((o) => {
                const sel = answers[q.id]?.selected?.includes(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => pick(o.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-sm transition-colors ${
                      sel ? 'border-zerdeli-500 bg-zerdeli-50/60 font-semibold text-slate-900' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        sel ? 'border-zerdeli-500 bg-zerdeli-500 text-white' : 'border-slate-300'
                      }`}
                    >
                      {sel && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                    {o.option_text}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</div>}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            disabled={idx === 0}
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" /> Алдыңғы
          </button>
          {idx < test.questions.length - 1 ? (
            <button
              onClick={() => setIdx((i) => i + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-5 py-2.5 text-xs font-bold text-white"
            >
              Келесі <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-2.5 text-xs font-bold text-white disabled:opacity-70"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Аяқтау <CheckCircle2 className="h-4 w-4" /></>}
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Link
        href="/student/tests"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-zerdeli-700"
      >
        <ChevronLeft className="h-4 w-4" /> Тесттер
      </Link>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {children}
      </motion.div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-black text-slate-900">{value}</div>
    </div>
  );
}
