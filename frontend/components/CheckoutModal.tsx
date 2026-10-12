'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { checkout } from '@/lib/api';

export interface CheckoutItem {
  kind: 'course' | 'package';
  id: string;
  title: string;
  price: number;
  kaspiMonth?: number;
}

const METHODS = [
  { id: 'kaspi_qr', label: 'Kaspi QR', hint: 'Бірден толық төлеу' },
  { id: 'kaspi_012', label: 'Kaspi 0-0-12', hint: '0% · 12 айға бөліп' },
  { id: 'card', label: 'Банк картасы', hint: 'Visa / Mastercard' },
];

export function CheckoutModal({
  item,
  onClose,
  onSuccess,
}: {
  item: CheckoutItem | null;
  onClose: () => void;
  onSuccess: (item: CheckoutItem) => void;
}) {
  const [method, setMethod] = useState('kaspi_qr');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!item) return null;

  const pay = async () => {
    setBusy(true);
    setError('');
    try {
      await checkout(item.kind, item.id, method);
      setDone(true);
      setTimeout(() => onSuccess(item), 1100);
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(String(d || 'Төлем өтпеді. Қайталап көріңіз.'));
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>

          {done ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </span>
              <div className="text-lg font-black text-slate-900">Төлем сәтті өтті! 🎉</div>
              <div className="text-sm text-slate-500">«{item.title}» қолжетімді болды.</div>
            </div>
          ) : (
            <>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-zerdeli-600">
                {item.kind === 'package' ? 'ҰБТ пакеті' : 'Курс'}
              </div>
              <h3 className="text-lg font-black text-slate-900">{item.title}</h3>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-500">Төлеуге</span>
                  <span className="text-2xl font-black text-slate-900">{item.price.toLocaleString('ru')} ₸</span>
                </div>
                {item.kaspiMonth ? (
                  <div className="mt-1 border-t border-slate-200 pt-1 text-xs font-bold text-slate-500">
                    <span className="text-[#F14635]">Kaspi 0-0-12:</span>{' '}
                    <span className="text-slate-900">{item.kaspiMonth.toLocaleString('ru')} ₸ / ай</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 space-y-2">
                <div className="text-xs font-bold text-slate-600">Төлем әдісі</div>
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                      method === m.id ? 'border-zerdeli-500 bg-zerdeli-50/60' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{m.label}</div>
                      <div className="text-[11px] text-slate-500">{m.hint}</div>
                    </div>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        method === m.id ? 'border-zerdeli-500 bg-zerdeli-500 text-white' : 'border-slate-300'
                      }`}
                    >
                      {method === m.id && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                ))}
              </div>

              {error && <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</div>}

              <button
                onClick={pay}
                disabled={busy}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-zerdeli-500/25 disabled:opacity-70"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Төлеу <ArrowRight className="h-4 w-4" /></>}
              </button>
              <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Қорғалған төлем · демо режим
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
