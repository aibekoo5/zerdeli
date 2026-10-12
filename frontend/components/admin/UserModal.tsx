'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { adminCreateUser } from '@/lib/api';

const ROLES = ['STUDENT', 'TEACHER', 'CURATOR', 'MANAGER', 'ADMIN'];

export function UserModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState<{ email: string; temp_password: string } | null>(null);

  const field = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-zerdeli-500 focus:outline-none';

  const save = async () => {
    setErr('');
    if (name.trim().length < 2 || !email.trim()) return setErr('Аты мен email керек');
    setBusy(true);
    try {
      const r = await adminCreateUser({
        email: email.trim(),
        full_name: name.trim(),
        phone: phone || null,
        role,
      });
      setResult({ email: r.email, temp_password: r.temp_password });
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Қате');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
        {result ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <div className="text-lg font-black text-slate-900">Қолданушы құрылды</div>
            <div className="w-full rounded-xl bg-slate-50 p-3 text-left text-xs">
              <div>Email: <span className="font-mono font-bold">{result.email}</span></div>
              <div>Уақытша пароль: <span className="font-mono font-bold">{result.temp_password}</span></div>
            </div>
            <button onClick={onDone} className="mt-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-6 py-2.5 text-sm font-bold text-white">
              Жабу
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-black text-slate-900">Жаңа қолданушы</h3>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Аты-жөні" className={field} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className={field} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" className={field} />
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <button key={r} onClick={() => setRole(r)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${role === r ? 'bg-zerdeli-600 text-white' : 'border border-slate-200 text-slate-500'}`}>
                  {r}
                </button>
              ))}
            </div>
            {err && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{err}</div>}
            <button onClick={save} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-3 text-sm font-bold text-white disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Құру'}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
