'use client';

import React, { useState } from 'react';
import { Search, RefreshCw, UserPlus, Ban, Check } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { adminUsers, adminSetRole, adminUpdateUser } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';
import { UserModal } from '@/components/admin/UserModal';

const roleOrder = ['STUDENT', 'TEACHER', 'CURATOR', 'MANAGER', 'ADMIN'];
const roleTint: Record<string, string> = {
  ADMIN: 'bg-rose-50 text-rose-700',
  MANAGER: 'bg-violet-50 text-violet-700',
  CURATOR: 'bg-teal-50 text-teal-700',
  TEACHER: 'bg-sky-50 text-sky-700',
  STUDENT: 'bg-zerdeli-50 text-zerdeli-700',
};
const FILTERS = ['ALL', ...roleOrder];

export default function AdminUsersPage() {
  const { data, loading, error, reload } = useApi(() => adminUsers());
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [busy, setBusy] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [patch, setPatch] = useState<Record<string, { role?: string; is_active?: boolean }>>({});

  const cycle = async (id: string, current: string) => {
    const next = roleOrder[(roleOrder.indexOf(current) + 1) % roleOrder.length];
    setBusy(id);
    try {
      await adminSetRole(id, next);
      setPatch((p) => ({ ...p, [id]: { ...p[id], role: next } }));
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  const toggleActive = async (id: string, cur: boolean) => {
    setBusy(id);
    try {
      await adminUpdateUser(id, { is_active: !cur });
      setPatch((p) => ({ ...p, [id]: { ...p[id], is_active: !cur } }));
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  const list = (data || [])
    .map((u) => ({ ...u, ...patch[u.id] }))
    .filter(
      (u) =>
        (roleFilter === 'ALL' || u.role === roleFilter) &&
        (u.full_name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Пайдаланушылар</h1>
          <p className="mt-1 text-sm text-slate-500">Рөлдер, қолжетімділік, жаңа аккаунт құру.</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-4 py-2.5 text-sm font-bold text-white"
        >
          <UserPlus className="h-4 w-4" /> Жаңа қолданушы
        </button>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Аты немесе email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-zerdeli-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setRoleFilter(f)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold ${roleFilter === f ? 'bg-zerdeli-600 text-white' : 'border border-slate-200 text-slate-500'}`}
                >
                  {f === 'ALL' ? 'Барлығы' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr className="border-b border-slate-100">
                  <th className="p-4 font-semibold">Аты-жөні</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Рөлі</th>
                  <th className="p-4 font-semibold">Күй</th>
                  <th className="p-4 text-right font-semibold">Әрекет</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-slate-900">{u.full_name}</td>
                    <td className="p-4 text-slate-500">{u.email}</td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${roleTint[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${u.is_active === false ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {u.is_active === false ? 'Бұғатталған' : 'Белсенді'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => cycle(u.id, u.role)}
                          disabled={busy === u.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:border-zerdeli-500 hover:text-zerdeli-700 disabled:opacity-50"
                        >
                          <RefreshCw className={`h-3 w-3 ${busy === u.id ? 'animate-spin' : ''}`} /> Рөл
                        </button>
                        <button
                          onClick={() => toggleActive(u.id, u.is_active !== false)}
                          disabled={busy === u.id}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold disabled:opacity-50 ${
                            u.is_active === false ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {u.is_active === false ? <Check className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                          {u.is_active === false ? 'Ашу' : 'Бұғаттау'}
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

      {modal && (
        <UserModal
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
