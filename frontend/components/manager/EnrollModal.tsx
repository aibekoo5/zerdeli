'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, CheckCircle2, GraduationCap, Package as PackageIcon } from 'lucide-react';
import { getCourses, getPackages, managerConvertLead, managerEnrollStudent, Course, Package } from '@/lib/api';

interface BaseProps {
  onClose: () => void;
  onDone: () => void;
}
type Props =
  | (BaseProps & { mode: 'convert'; leadId: string; leadName: string })
  | (BaseProps & { mode: 'enroll'; studentId: string; studentName: string });

const METHODS = [
  { id: 'kaspi_qr', label: 'Kaspi QR' },
  { id: 'kaspi_012', label: 'Kaspi 0-0-12' },
  { id: 'card', label: 'Карта' },
];

export function EnrollModal(props: Props) {
  const { onClose, onDone, mode } = props;
  const [courses, setCourses] = useState<Course[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [tab, setTab] = useState<'package' | 'course'>('package');
  const [sel, setSel] = useState<{ kind: 'course' | 'package'; id: string } | null>(null);
  const [method, setMethod] = useState('kaspi_qr');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState<{ temp_password?: string; enrolled_title?: string } | null>(null);

  useEffect(() => {
    getCourses().then(setCourses).catch(() => {});
    getPackages().then(setPackages).catch(() => {});
  }, []);

  const submit = async () => {
    setErr('');
    if (mode === 'convert' && !email.trim()) {
      setErr('Email енгізіңіз');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'convert') {
        const r = await managerConvertLead(props.leadId, {
          email: email.trim(),
          full_name: props.leadName,
          ...(sel ? { kind: sel.kind, item_id: sel.id, method } : {}),
        });
        setResult({ temp_password: r.temp_password, enrolled_title: r.enrolled_title });
      } else {
        if (!sel) {
          setErr('Курс немесе пакет таңдаңыз');
          setBusy(false);
          return;
        }
        await managerEnrollStudent(props.studentId, sel.kind, sel.id, method);
        setResult({});
        setTimeout(onDone, 900);
      }
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErr(String(d || 'Қате шықты'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>

        {result ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <div className="text-lg font-black text-slate-900">
              {mode === 'convert' ? 'Оқушы құрылды! 🎉' : 'Курсқа қосылды!'}
            </div>
            {result.enrolled_title && <div className="text-sm text-slate-500">«{result.enrolled_title}» ашылды</div>}
            {mode === 'convert' && result.temp_password && (
              <div className="mt-2 w-full rounded-xl bg-slate-50 p-3 text-left text-xs">
                <div className="font-bold text-slate-700">Кіру мәліметтері:</div>
                <div className="text-slate-600">Email: {email}</div>
                <div className="text-slate-600">Уақытша пароль: <span className="font-mono font-bold">{result.temp_password}</span></div>
              </div>
            )}
            <button onClick={onDone} className="mt-3 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-6 py-2.5 text-sm font-bold text-white">
              Жабу
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-black text-slate-900">
              {mode === 'convert' ? `${props.leadName} → оқушы` : `${props.studentName} — курсқа қосу`}
            </h3>

            {mode === 'convert' && (
              <label className="mt-4 block text-sm">
                <span className="mb-1 block font-semibold text-slate-600">Оқушының email-і</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-zerdeli-500 focus:outline-none"
                />
              </label>
            )}

            <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              {(['package', 'course'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setSel(null);
                  }}
                  className={`flex-1 rounded-lg px-3 py-2 ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  {t === 'package' ? 'ҰБТ пакеті' : 'Жеке курс'}
                </button>
              ))}
            </div>

            <div className="mt-3 max-h-52 space-y-2 overflow-y-auto">
              {tab === 'package'
                ? packages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSel({ kind: 'package', id: p.id })}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm ${
                        sel?.id === p.id ? 'border-zerdeli-500 bg-zerdeli-50/60' : 'border-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-bold text-slate-900">
                        <PackageIcon className="h-4 w-4 text-zerdeli-600" /> {p.name}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{p.price.toLocaleString('ru')} ₸</span>
                    </button>
                  ))
                : courses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSel({ kind: 'course', id: c.id })}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm ${
                        sel?.id === c.id ? 'border-zerdeli-500 bg-zerdeli-50/60' : 'border-slate-200'
                      }`}
                    >
                      <span className="flex items-center gap-2 font-semibold text-slate-900">
                        <GraduationCap className="h-4 w-4 text-zerdeli-600" /> {c.title}
                      </span>
                      <span className="shrink-0 text-xs font-bold text-slate-500">
                        {(c.discount_price || c.price).toLocaleString('ru')} ₸
                      </span>
                    </button>
                  ))}
            </div>

            {(sel || mode === 'convert') && (
              <div className="mt-3 flex gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-[11px] font-bold ${
                      method === m.id ? 'border-zerdeli-500 bg-zerdeli-50 text-zerdeli-700' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            {err && <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{err}</div>}

            <button
              onClick={submit}
              disabled={busy}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'convert' ? 'Оқушыны құру' : 'Курсқа қосу'}
            </button>
            {mode === 'convert' && !sel && (
              <p className="mt-2 text-center text-[11px] text-slate-400">Курс/пакет таңдамай да аккаунт құруға болады</p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
