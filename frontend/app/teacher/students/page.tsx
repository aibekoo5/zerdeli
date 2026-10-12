'use client';

import React, { useState } from 'react';
import { Search, Phone, Mail } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { teacherStudents } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';

const statusTint: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  at_risk: 'bg-rose-50 text-rose-700',
  trial: 'bg-amber-50 text-amber-700',
};
const statusLabel: Record<string, string> = { active: 'Белсенді', at_risk: 'Қауіп-қатер', trial: 'Сынақта' };

export default function TeacherStudentsPage() {
  const { data, loading, error, reload } = useApi<any[]>(teacherStudents);
  const [q, setQ] = useState('');
  const list = (data || []).filter((s) => s.full_name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Оқушылар мен CRM</h1>
        <p className="mt-1 text-sm text-slate-500">Курстарыңызға жазылған оқушылар және олардың прогресі.</p>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyBlock title="Оқушылар жоқ" hint="Курстарыңызға оқушы жазылғанда осында көрінеді." />}

      {data && data.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4">
            <div className="relative flex-1">
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
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr className="border-b border-slate-100">
                  <th className="p-4 font-semibold">Оқушы</th>
                  <th className="p-4 font-semibold">Курстар</th>
                  <th className="p-4 font-semibold">Прогресс</th>
                  <th className="p-4 font-semibold">Соңғы балл</th>
                  <th className="p-4 font-semibold">Күй</th>
                  <th className="p-4 font-semibold">Төлем</th>
                  <th className="p-4 text-right font-semibold">Байланыс</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{s.full_name}</td>
                    <td className="p-4 text-xs text-slate-500">{s.course_titles.filter(Boolean).join(', ') || '—'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-zerdeli-400 to-zerdeli-600" style={{ width: `${s.progress_pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{s.progress_pct}%</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{s.last_score != null ? `${Math.round(s.last_score)}%` : '—'}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTint[s.status]}`}>{statusLabel[s.status]}</span>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${s.has_paid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {s.has_paid ? 'Төленген' : 'Қарыз'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {s.phone && (
                          <a href={`tel:${s.phone}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-zerdeli-50 hover:text-zerdeli-600">
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                        <a href={`mailto:${s.email}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-zerdeli-50 hover:text-zerdeli-600">
                          <Mail className="h-4 w-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
