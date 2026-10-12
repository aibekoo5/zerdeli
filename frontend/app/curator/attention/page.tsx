'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { curatorStudents } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';
import { StudentCard } from '@/components/curator/shared';

export default function CuratorAttentionPage() {
  const { data, loading, error, reload } = useApi(curatorStudents);
  const inactive = (data || []).filter((s) => s.status === 'inactive');
  const attention = (data || []).filter((s) => s.status === 'attention');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Назар аудару</h1>
        <p className="mt-1 text-sm text-slate-500">Оқуды тоқтатқан немесе артта қалып бара жатқан оқушылар.</p>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <>
          {inactive.length === 0 && attention.length === 0 && (
            <EmptyBlock title="Бәрі жақсы 👍" hint="Назар аударуды қажет ететін оқушы жоқ." />
          )}

          {inactive.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-700">
                <AlertTriangle className="h-4 w-4" /> Белсенді емес ({inactive.length})
              </div>
              {inactive.map((s) => (
                <StudentCard key={s.id} s={s} />
              ))}
            </div>
          )}

          {attention.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                <AlertTriangle className="h-4 w-4" /> Назар аудару ({attention.length})
              </div>
              {attention.map((s) => (
                <StudentCard key={s.id} s={s} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
