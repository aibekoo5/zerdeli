'use client';

import React from 'react';
import { useApi } from '@/lib/useApi';
import { teacherGrades } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';

function cellTint(pct?: number) {
  if (pct == null) return 'text-slate-300';
  if (pct >= 85) return 'text-emerald-700 bg-emerald-50';
  if (pct >= 60) return 'text-amber-700 bg-amber-50';
  return 'text-rose-700 bg-rose-50';
}

export default function TeacherGradesPage() {
  const { data, loading, error, reload } = useApi<any>(teacherGrades);

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Бағалар журналы</h1>
        <p className="mt-1 text-sm text-slate-500">Оқушылар × тесттер — үздік нәтиже %.</p>
      </div>

      {data.students.length === 0 || data.tests.length === 0 ? (
        <EmptyBlock title="Дерек жоқ" hint="Оқушылар тест тапсырғанда журнал толады." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400">
                <th className="sticky left-0 z-10 bg-white p-3 font-semibold">Оқушы</th>
                {data.tests.map((t: any) => (
                  <th key={t.id} className="min-w-[90px] p-3 text-center font-semibold" title={t.title}>
                    {t.title.length > 16 ? t.title.slice(0, 14) + '…' : t.title}
                  </th>
                ))}
                <th className="p-3 text-center font-semibold">Орташа</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.students.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="sticky left-0 z-10 bg-white p-3 font-semibold text-slate-900">{s.full_name}</td>
                  {data.tests.map((t: any) => {
                    const cell = data.grades[s.id]?.[t.id];
                    return (
                      <td key={t.id} className="p-2 text-center">
                        {cell ? (
                          <span className={`inline-block rounded-md px-2 py-1 text-xs font-bold ${cellTint(cell.percentage)}`}>
                            {Math.round(cell.percentage)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-3 text-center font-black text-slate-900">
                    {data.averages[s.id] != null ? `${Math.round(data.averages[s.id])}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
