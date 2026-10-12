'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { dashboardHrefFor } from '@/lib/api';
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      router.replace(dashboardHrefFor(user.role));
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Кіру мүмкін болмады. Байланысты тексеріңіз.';
      setError(String(detail));
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zerdeli-500/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-8 sm:p-10 max-w-md w-full border border-slate-200 relative z-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/zerdeli-logo.jpg"
              alt="Zerdeli"
              className="w-11 h-11 rounded-full ring-1 ring-slate-200 object-cover"
            />
            <span className="text-2xl font-black text-slate-900 tracking-tight">Zerdeli</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Жүйеге кіру</h1>
          <p className="text-xs text-slate-500">Платформаға кіру үшін мәліметтерді енгізіңіз</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-600 font-semibold mb-1 block">Электронды пошта</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="student@zerdeli.kz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-zerdeli-500 focus:ring-2 focus:ring-zerdeli-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-semibold mb-1 block">Құпия сөз</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-zerdeli-500 focus:ring-2 focus:ring-zerdeli-500/20"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: busy ? 1 : 1.02 }}
            whileTap={{ scale: busy ? 1 : 0.98 }}
            type="submit"
            disabled={busy}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 text-white font-bold text-sm shadow-lg shadow-zerdeli-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Кіру</span>}
            {!busy && <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </form>

        <p className="text-center text-xs text-slate-500">Кіру мәліметтерін орталық әкімшісінен алыңыз.</p>

        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-zerdeli-300 hover:text-zerdeli-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Басты бетке оралу
        </Link>
      </motion.div>
    </main>
  );
}
