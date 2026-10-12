'use client';

import React from 'react';
import { Mail } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { adminTeachers } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';

export default function AdminTeachersPage() {
  const { data, loading, error, reload } = useApi<any[]>(adminTeachers);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Мұғалімдер</h1>
        <p className="mt-1 text-sm text-slate-500">Ұстаздар, олардың курстары, оқушылары және табысы.</p>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((t) => (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-zerdeli-500 to-zerdeli-600 text-sm font-bold text-white">
                  {t.full_name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{t.full_name}</div>
                  <a href={`mailto:${t.email}`} className="flex items-center gap-1 text-xs text-slate-500">
                    <Mail className="h-3 w-3" /> {t.email}
                  </a>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2">
                  <div className="font-black text-slate-900">{t.courses}</div>
                  <div className="text-slate-500">курс</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <div className="font-black text-slate-900">{t.students}</div>
                  <div className="text-slate-500">оқушы</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <div className="font-black text-emerald-600">{Math.round(t.revenue / 1000)}к</div>
                  <div className="text-slate-500">₸</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
