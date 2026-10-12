'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Phone, Clock } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { managerPayments } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';

export default function ManagerPaymentsPage() {
  const { data, loading, error, reload } = useApi<any>(managerPayments);

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  const kpi = [
    { label: 'Осы ай жиналды', value: `${Number(data.collected_this_month).toLocaleString('ru')} ₸`, tint: 'text-emerald-600' },
    { label: 'Күтіліп тұр', value: `${Number(data.pending).toLocaleString('ru')} ₸`, tint: 'text-amber-600' },
    { label: 'Қарыз (болжам)', value: `${Number(data.overdue).toLocaleString('ru')} ₸`, tint: 'text-rose-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Төлемдер &amp; қарыздар</h1>
        <p className="mt-1 text-sm text-slate-500">Оқушы төлемдерін бақылау және қарыздарды жабу.</p>
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
            <div className={`mt-1 text-2xl font-black ${k.tint}`}>{k.value}</div>
          </motion.div>
        ))}
      </div>

      {(data.debtors || []).length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900">Төлемсіз оқушылар</h2>
          </div>
          {data.debtors.map((d: any, i: number) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-4"
            >
              <div>
                <div className="text-sm font-bold text-slate-900">{d.full_name}</div>
                <div className="flex items-center gap-1.5 text-xs text-rose-600">
                  <Clock className="h-3 w-3" /> {d.direction} · төлем жоқ
                </div>
              </div>
              {d.phone && (
                <a
                  href={`tel:${d.phone}`}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700"
                >
                  <Phone className="h-3.5 w-3.5" /> Қоңырау
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        <div className="px-4 py-3 text-sm font-bold text-slate-900">Соңғы төлемдер</div>
        {(data.recent || []).map((r: any, i: number) => (
          <div
            key={r.id}
            className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${i > 0 ? 'border-t border-slate-100' : ''}`}
          >
            <div>
              <div className="font-semibold text-slate-900">{r.item_title}</div>
              <div className="text-xs text-slate-500">
                {r.payment_method} · {new Date(r.created_at).toLocaleDateString('ru')}
              </div>
            </div>
            <span className="flex items-center gap-1.5 font-bold text-emerald-600">
              +{Number(r.amount).toLocaleString('ru')} ₸ <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
