'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CuratorStudent } from '@/lib/api';

export const STATUS: Record<string, { label: string; tint: string }> = {
  ok: { label: 'Қалыпты', tint: 'bg-emerald-50 text-emerald-700' },
  attention: { label: 'Назар аудару', tint: 'bg-amber-50 text-amber-700' },
  inactive: { label: 'Белсенді емес', tint: 'bg-rose-50 text-rose-700' },
};

export function ago(iso?: string | null) {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'бүгін';
  if (days === 1) return 'кеше';
  return `${days} күн бұрын`;
}

export function StudentCard({ s }: { s: CuratorStudent }) {
  const st = STATUS[s.status] || STATUS.ok;
  return (
    <Link
      href={`/curator/students/${s.id}`}
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-teal-300"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-sm font-bold text-white">
          {s.full_name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-bold text-slate-900">{s.full_name}</div>
          <div className="truncate text-xs text-slate-500">
            {s.direction} · прогресс {s.progress_pct}% · соңғы кіру {ago(s.last_login_at)}
            {s.unfinished_homework > 0 && (
              <span className="text-rose-500"> · {s.unfinished_homework} ҮЖ орындалмаған</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${st.tint}`}>{st.label}</span>
        <ChevronRight className="h-4 w-4 text-slate-300" />
      </div>
    </Link>
  );
}
