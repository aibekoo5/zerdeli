'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { adminCourses, adminUpdateCourse } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';
import { CourseModal } from '@/components/admin/CourseModal';

export default function AdminCoursesPage() {
  const { data, loading, error, reload } = useApi(adminCourses);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [patch, setPatch] = useState<Record<string, boolean>>({});

  const togglePub = async (id: string, cur: boolean) => {
    setBusy(id);
    try {
      await adminUpdateCourse(id, { is_published: !cur });
      setPatch((p) => ({ ...p, [id]: !cur }));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Курстар</h1>
          <p className="mt-1 text-sm text-slate-500">Платформадағы барлық курстар.</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-4 py-2.5 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" /> Жаңа курс
        </button>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr className="border-b border-slate-100">
                <th className="p-4 font-semibold">Курс</th>
                <th className="p-4 font-semibold">Бағыт</th>
                <th className="p-4 font-semibold">Ұстаз</th>
                <th className="p-4 font-semibold">Оқушы</th>
                <th className="p-4 font-semibold">Табыс</th>
                <th className="p-4 font-semibold">Күй</th>
                <th className="p-4 text-right font-semibold">Әрекет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((c) => {
                const pub = patch[c.id] ?? c.is_published;
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{c.title}</td>
                    <td className="p-4 text-slate-500">{c.direction}</td>
                    <td className="p-4 text-slate-500">{c.teacher_name || '—'}</td>
                    <td className="p-4 font-bold text-slate-900">{c.students}</td>
                    <td className="p-4 font-bold text-emerald-600">{Number(c.revenue).toLocaleString('ru')} ₸</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${pub ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {pub ? 'Жарияланған' : 'Жоба'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/courses/${c.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:border-zerdeli-300"
                        >
                          <Pencil className="h-3 w-3" /> Құрылым
                        </Link>
                        <button
                          onClick={() => togglePub(c.id, pub)}
                          disabled={busy === c.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        >
                          {busy === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : pub ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {pub ? 'Жасыру' : 'Жариялау'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <CourseModal
          onClose={() => setModal(false)}
          onDone={() => {
            setModal(false);
            reload();
          }}
        />
      )}
    </div>
  );
}
