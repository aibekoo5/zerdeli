'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowUpRight, RotateCcw, Clock, XCircle } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { adminFinance, adminUpdatePayment } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';

const STATUS: Record<string, { label: string; tint: string }> = {
  completed: { label: 'Paid', tint: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Pending', tint: 'bg-amber-50 text-amber-700' },
  failed: { label: 'Failed', tint: 'bg-rose-50 text-rose-700' },
  refunded: { label: 'Refunded', tint: 'bg-slate-100 text-slate-500' },
};

export default function AdminFinancePage() {
  const { data, loading, error, reload } = useApi<any>(adminFinance);
  const [patch, setPatch] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const refund = async (id: string) => {
    setBusy(id);
    try {
      await adminUpdatePayment(id, 'refunded');
      setPatch((p) => ({ ...p, [id]: 'refunded' }));
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  const kpi = [
    { label: 'Жалпы түсім', value: `${Number(data.total_revenue).toLocaleString('ru')} ₸`, Icon: ArrowUpRight, tint: 'text-emerald-600' },
    { label: 'Осы айда', value: `${Number(data.this_month).toLocaleString('ru')} ₸`, Icon: ArrowUpRight, tint: 'text-zerdeli-700' },
    { label: 'Қайтарулар', value: `${Number(data.refunded).toLocaleString('ru')} ₸`, Icon: RotateCcw, tint: 'text-rose-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Қаржы &amp; төлемдер</h1>
        <p className="mt-1 text-sm text-slate-500">Оқушы төлемдерінің нақты есебі.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpi.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="text-xs font-semibold text-slate-500">{k.label}</div>
            <div className={`mt-1 text-xl font-black ${k.tint}`}>{k.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <div className="px-4 py-3 text-sm font-bold text-slate-900">Соңғы төлемдер (Payments)</div>
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-400">
            <tr className="border-y border-slate-100">
              <th className="p-3 font-semibold">№</th>
              <th className="p-3 font-semibold">Курс / пакет</th>
              <th className="p-3 font-semibold">Әдіс</th>
              <th className="p-3 font-semibold">Сома</th>
              <th className="p-3 font-semibold">Дата</th>
              <th className="p-3 font-semibold">Статус</th>
              <th className="p-3 text-right font-semibold">Әрекет</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data.payments || []).map((t: any, i: number) => {
              const st = STATUS[patch[t.id] || t.status] || STATUS.pending;
              const cur = patch[t.id] || t.status;
              return (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-400">{i + 1}</td>
                  <td className="p-3 font-semibold text-slate-900">{t.item_title}</td>
                  <td className="p-3 text-slate-500">{t.payment_method}</td>
                  <td className="p-3 font-bold text-slate-900">{Number(t.amount).toLocaleString('ru')} ₸</td>
                  <td className="p-3 text-slate-500">{new Date(t.created_at).toLocaleDateString('ru')}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${st.tint}`}>
                      {cur === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : cur === 'pending' ? <Clock className="h-3 w-3" /> : cur === 'failed' ? <XCircle className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
                      {st.label}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {cur === 'completed' && (
                      <button
                        onClick={() => refund(t.id)}
                        disabled={busy === t.id}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:border-rose-300 hover:text-rose-600 disabled:opacity-50"
                      >
                        {busy === t.id ? '...' : 'Қайтару'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
