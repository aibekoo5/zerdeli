'use client';

import React from 'react';
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />;
}

export function LoadingBlock({ label = 'Жүктелуде…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin text-zerdeli-500" />
      {label}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message?: string | null; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 py-12 text-center">
      <AlertTriangle className="h-6 w-6 text-rose-500" />
      <div className="text-sm font-medium text-rose-700">{message || 'Дерек жүктелмеді'}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
        >
          Қайталау
        </button>
      )}
    </div>
  );
}

export function EmptyBlock({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Inbox className="h-6 w-6" />
      </span>
      <div className="text-sm font-bold text-slate-900">{title}</div>
      {hint && <div className="max-w-sm text-xs text-slate-500">{hint}</div>}
      {action}
    </div>
  );
}
