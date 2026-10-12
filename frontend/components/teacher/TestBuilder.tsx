'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { teacherCreateTest } from '@/lib/api';

interface Opt { text: string; is_correct: boolean }
interface Q { text: string; question_type: string; points: number; explanation: string; options: Opt[] }

const KINDS = [
  { id: 'quiz', label: 'Quiz' },
  { id: 'section', label: 'Бөлім тесті' },
  { id: 'homework', label: 'Үй жұмысы' },
  { id: 'practice', label: 'Практикалық' },
  { id: 'trial', label: 'Сынақ тест' },
  { id: 'monthly', label: 'Айлық' },
  { id: 'final', label: 'Қорытынды' },
];

function newQ(): Q {
  return {
    text: '',
    question_type: 'single_choice',
    points: 5,
    explanation: '',
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
    ],
  };
}

export function TestBuilder({
  courseId,
  moduleId,
  moduleTitle,
  onClose,
  onDone,
}: {
  courseId: string;
  moduleId?: string;
  moduleTitle?: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState(moduleId ? 'section' : 'quiz');
  const [duration, setDuration] = useState(15);
  const [pass, setPass] = useState(70);
  const [questions, setQuestions] = useState<Q[]>([newQ()]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const field = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-zerdeli-500 focus:outline-none';

  const upd = (i: number, patch: Partial<Q>) => setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const updOpt = (qi: number, oi: number, patch: Partial<Opt>) =>
    setQuestions((qs) =>
      qs.map((q, j) =>
        j === qi
          ? {
              ...q,
              options: q.options.map((o, k) =>
                k === oi
                  ? { ...o, ...patch }
                  : patch.is_correct && q.question_type === 'single_choice'
                  ? { ...o, is_correct: false }
                  : o,
              ),
            }
          : q,
      ),
    );

  const save = async () => {
    setErr('');
    if (title.trim().length < 2) return setErr('Тест атауын енгізіңіз');
    for (const q of questions) {
      if (!q.text.trim()) return setErr('Барлық сұрақтың мәтіні болуы керек');
      if (q.question_type !== 'numerical') {
        const filled = q.options.filter((o) => o.text.trim());
        if (filled.length < 2) return setErr('Әр сұраққа кемінде 2 нұсқа керек');
        if (!filled.some((o) => o.is_correct)) return setErr('Әр сұрақта дұрыс жауап белгіленуі керек');
      }
    }
    setBusy(true);
    try {
      await teacherCreateTest({
        course_id: courseId,
        module_id: moduleId || null,
        title: title.trim(),
        kind,
        duration_minutes: duration,
        passing_score: pass,
        questions: questions.map((q) => ({
          text: q.text.trim(),
          question_type: q.question_type,
          points: q.points,
          explanation: q.explanation || null,
          options: q.options.filter((o) => o.text.trim()).map((o) => ({ text: o.text.trim(), is_correct: o.is_correct })),
        })),
      });
      onDone();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Қате');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative my-6 w-full max-w-2xl space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900">Жаңа тест</h3>
          {moduleTitle && <p className="text-xs text-slate-500">{moduleTitle}</p>}
        </div>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Тест атауы" className={field} />
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              onClick={() => setKind(k.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${kind === k.id ? 'bg-zerdeli-600 text-white' : 'border border-slate-200 text-slate-500'}`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 text-sm">
          <label className="flex items-center gap-2">
            Уақыт (мин)
            <input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} className={`${field} w-20`} />
          </label>
          <label className="flex items-center gap-2">
            Өту балы %
            <input type="number" value={pass} onChange={(e) => setPass(+e.target.value)} className={`${field} w-20`} />
          </label>
        </div>

        <div className="space-y-3">
          {questions.map((q, qi) => (
            <div key={qi} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Сұрақ {qi + 1}</span>
                <div className="flex items-center gap-2">
                  <select
                    value={q.question_type}
                    onChange={(e) => upd(qi, { question_type: e.target.value })}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                  >
                    <option value="single_choice">Бір жауап</option>
                    <option value="multiple_choice">Бірнеше жауап</option>
                    <option value="numerical">Сандық</option>
                  </select>
                  <input
                    type="number"
                    value={q.points}
                    onChange={(e) => upd(qi, { points: +e.target.value })}
                    className="w-14 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
                    title="Балл"
                  />
                  {questions.length > 1 && (
                    <button onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== qi))} className="text-rose-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                value={q.text}
                onChange={(e) => upd(qi, { text: e.target.value })}
                rows={2}
                placeholder="Сұрақ мәтіні"
                className={`${field} resize-none`}
              />
              <div className="mt-2 space-y-1.5">
                {q.options.map((o, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <button
                      onClick={() => updOpt(qi, oi, { is_correct: !o.is_correct })}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        o.is_correct ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'
                      }`}
                    >
                      {o.is_correct && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                    <input
                      value={o.text}
                      onChange={(e) => updOpt(qi, oi, { text: e.target.value })}
                      placeholder={q.question_type === 'numerical' ? 'Дұрыс сандық жауап' : `Нұсқа ${oi + 1}`}
                      className={field}
                    />
                    {q.options.length > 2 && q.question_type !== 'numerical' && (
                      <button onClick={() => upd(qi, { options: q.options.filter((_, k) => k !== oi) })} className="text-slate-400 hover:text-rose-500">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                {q.question_type !== 'numerical' && (
                  <button
                    onClick={() => upd(qi, { options: [...q.options, { text: '', is_correct: false }] })}
                    className="flex items-center gap-1 text-xs font-bold text-zerdeli-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Нұсқа қосу
                  </button>
                )}
              </div>
              <input
                value={q.explanation}
                onChange={(e) => upd(qi, { explanation: e.target.value })}
                placeholder="💡 Түсіндірме (міндетті емес)"
                className={`${field} mt-2`}
              />
            </div>
          ))}
          <button
            onClick={() => setQuestions((qs) => [...qs, newQ()])}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-xs font-bold text-slate-500 hover:border-zerdeli-400 hover:text-zerdeli-700"
          >
            <Plus className="h-4 w-4" /> Сұрақ қосу
          </button>
        </div>

        {err && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{err}</div>}
        <button
          onClick={save}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : `Жариялау (${questions.length} сұрақ)`}
        </button>
      </motion.div>
    </div>
  );
}
