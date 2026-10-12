'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { curatorStudents } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';
import { StudentCard } from '@/components/curator/shared';

const FILTERS = [
  { id: 'all', label: 'Барлығы' },
  { id: 'attention', label: 'Назар аудару' },
  { id: 'inactive', label: 'Белсенді емес' },
  { id: 'ok', label: 'Қалыпты' },
];

export default function CuratorStudentsPage() {
  const { data, loading, error, reload } = useApi(curatorStudents);
  const [q, setQ] = useState('');
  const [f, setF] = useState('all');

  const list = (data || []).filter(
    (s) => (f === 'all' || s.status === f) && s.full_name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Менің оқушыларым</h1>
        <p className="mt-1 text-sm text-slate-500">Бекітілген оқушылардың толық тізімі мен күйі.</p>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Оқушыны іздеу..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((x) => (
                <button
                  key={x.id}
                  onClick={() => setF(x.id)}
                  className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                    f === x.id ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>

          {list.length === 0 ? (
            <EmptyBlock title="Оқушы табылмады" />
          ) : (
            <div className="space-y-2">
              {list.map((s) => (
                <StudentCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
