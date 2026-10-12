'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Lock, ChevronLeft } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { getTest } from '@/lib/api';
import { LoadingBlock } from '@/components/ui/States';
import { TestRunner } from '@/components/TestRunner';

export default function StudentTestRunnerPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { data, loading, error } = useApi(() => getTest(id), [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <LoadingBlock label="Сынақ жүктелуде…" />
      </div>
    );
  }

  if (error || !data) {
    const locked = /құлып|403/i.test(error || '');
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Lock className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-xl font-black text-slate-900">
          {locked ? 'Бұл сынақ құлыпталған' : 'Сынақ табылмады'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {locked
            ? 'Ашу үшін тиісті курсты немесе ҰБТ пакетін сатып алыңыз.'
            : error}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/student/tests"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" /> Тесттер
          </Link>
          {locked && (
            <Link
              href="/student/catalog"
              className="rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-4 py-2.5 text-xs font-bold text-white"
            >
              Каталогқа өту
            </Link>
          )}
        </div>
      </div>
    );
  }

  return <TestRunner test={data} />;
}
