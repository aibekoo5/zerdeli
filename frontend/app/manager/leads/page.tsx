'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Phone, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';
import { managerLeads, managerUpdateLead } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';

const columns = [
  { key: 'new', title: 'Жаңа лид', tint: 'border-slate-300' },
  { key: 'contact', title: 'Байланыста', tint: 'border-sky-300' },
  { key: 'trial', title: 'Сынақ сабақ', tint: 'border-amber-300' },
  { key: 'won', title: 'Оқушы болды', tint: 'border-emerald-300' },
];

interface Lead {
  id: string;
  name: string;
  phone: string;
  source: string;
  interest: string;
  stage: string;
  grade?: string | null;
}

export default function ManagerLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    managerLeads()
      .then((d) => setLeads(d as Lead[]))
      .catch((e) => setError(e?.response?.data?.detail || 'Жүктелмеді'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const move = async (id: string, dir: 1 | -1) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    const idx = columns.findIndex((c) => c.key === lead.stage);
    const next = columns[Math.min(columns.length - 1, Math.max(0, idx + dir))].key;
    if (next === lead.stage) return;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage: next } : l)));
    try {
      await managerUpdateLead(id, { stage: next });
    } catch {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage: lead.stage } : l)));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Өтінімдер &amp; лидтер</h1>
        <p className="mt-1 text-sm text-slate-500">Лидтерді кезеңдер бойынша жылжытыңыз — өзгеріс бірден сақталады.</p>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {columns.map((col) => {
            const items = leads.filter((l) => l.stage === col.key);
            return (
              <div key={col.key} className={`rounded-2xl border-t-4 ${col.tint} bg-white p-3 shadow-sm`}>
                <div className="mb-3 flex items-center justify-between px-1 text-sm font-bold text-slate-800">
                  {col.title}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((l) => (
                    <motion.div key={l.id} layout className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <Link href={`/manager/leads/${l.id}`} className="group block">
                        <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                          {l.name}
                          <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-zerdeli-500" />
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {l.interest} · {l.source}
                          {l.grade && ` · ${l.grade}-сынып`}
                        </div>
                      </Link>
                      <div className="mt-2 flex items-center justify-between">
                        <a href={`tel:${l.phone}`} className="rounded-lg bg-white p-1.5 text-slate-400 hover:text-zerdeli-600">
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                        <div className="flex gap-1">
                          <button onClick={() => move(l.id, -1)} className="rounded-lg bg-white p-1.5 text-slate-400 hover:text-slate-700">
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => move(l.id, 1)} className="rounded-lg bg-white p-1.5 text-zerdeli-600 hover:text-zerdeli-800">
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {items.length === 0 && <div className="px-1 py-4 text-center text-[11px] text-slate-300">—</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
