'use client';

import React, { useState } from 'react';
import { Search, Phone, GraduationCap } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { managerStudents } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';
import { EnrollModal } from '@/components/manager/EnrollModal';

export default function ManagerStudentsPage() {
  const { data, loading, error, reload } = useApi<any[]>(managerStudents);
  const [q, setQ] = useState('');
  const [enroll, setEnroll] = useState<{ id: string; name: string } | null>(null);
  const list = (data || []).filter((s) => s.full_name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Оқушылар</h1>
        <p className="mt-1 text-sm text-slate-500">Тіркелген оқушылар, олардың прогресі және төлем жағдайы.</p>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Оқушыны іздеу..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-zerdeli-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr className="border-b border-slate-100">
                  <th className="p-4 font-semibold">Оқушы</th>
                  <th className="p-4 font-semibold">Бағыт</th>
                  <th className="p-4 font-semibold">Прогресс</th>
                  <th className="p-4 font-semibold">Соңғы балл</th>
                  <th className="p-4 font-semibold">Төлеген</th>
                  <th className="p-4 font-semibold">Күй</th>
                  <th className="p-4 text-right font-semibold">Әрекет</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{s.full_name}</td>
                    <td className="p-4 text-slate-500">{s.direction}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-zerdeli-400 to-zerdeli-600" style={{ width: `${s.progress_pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{s.progress_pct}%</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{s.last_score != null ? `${Math.round(s.last_score)}%` : '—'}</td>
                    <td className="p-4 text-slate-500">{Number(s.total_paid).toLocaleString('ru')} ₸</td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          s.has_active_subscription || s.total_paid > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {s.has_active_subscription ? 'Белсенді пакет' : s.total_paid > 0 ? 'Курс сатып алған' : 'Төлемсіз'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {s.phone && (
                          <a href={`tel:${s.phone}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-zerdeli-50 hover:text-zerdeli-600">
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => setEnroll({ id: s.id, name: s.full_name })}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:border-zerdeli-300 hover:text-zerdeli-700"
                        >
                          <GraduationCap className="h-3.5 w-3.5" /> Курсқа қосу
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {enroll && (
        <EnrollModal
          mode="enroll"
          studentId={enroll.id}
          studentName={enroll.name}
          onClose={() => setEnroll(null)}
          onDone={() => {
            setEnroll(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
