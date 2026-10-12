'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Phone, MessageCircle, Mail, UserPlus, Loader2 } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { managerLead, managerUpdateLead } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';
import { EnrollModal } from '@/components/manager/EnrollModal';

const PIPELINE = [
  { key: 'new', label: 'Жаңа өтінім' },
  { key: 'contact', label: 'Байланыста' },
  { key: 'trial', label: 'Сынақ сабақ' },
  { key: 'won', label: 'Оқушы болды' },
];
const STAGE_TINT: Record<string, string> = {
  new: 'bg-slate-100 text-slate-700',
  contact: 'bg-sky-50 text-sky-700',
  trial: 'bg-amber-50 text-amber-700',
  won: 'bg-emerald-50 text-emerald-700',
  lost: 'bg-rose-50 text-rose-700',
};

export default function ManagerLeadDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const { data, loading, error, reload } = useApi(() => managerLead(id), [id]);
  const [modal, setModal] = useState(false);
  const [savingStage, setSavingStage] = useState('');

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  const curIdx = PIPELINE.findIndex((p) => p.key === data.stage);

  const setStage = async (key: string) => {
    setSavingStage(key);
    try {
      await managerUpdateLead(id, { stage: key });
      reload();
    } finally {
      setSavingStage('');
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/manager/leads" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-zerdeli-700">
        <ChevronLeft className="h-4 w-4" /> Лидтер тақтасы
      </Link>

      {/* Pipeline */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3">
        {PIPELINE.map((p, i) => (
          <React.Fragment key={p.key}>
            <button
              onClick={() => setStage(p.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                i <= curIdx ? 'bg-zerdeli-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {savingStage === p.key ? <Loader2 className="h-3 w-3 animate-spin" /> : <span>{i + 1}</span>}
              {p.label}
            </button>
            {i < PIPELINE.length - 1 && <div className={`h-0.5 w-4 shrink-0 ${i < curIdx ? 'bg-zerdeli-500' : 'bg-slate-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* CRM card */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900">{data.name}</h1>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${STAGE_TINT[data.stage]}`}>
                {PIPELINE.find((p) => p.key === data.stage)?.label || data.stage}
              </span>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-semibold text-slate-400">Телефон</dt>
              <dd className="font-semibold text-slate-900">{data.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400">Email</dt>
              <dd className="font-semibold text-slate-900">{data.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400">Сынып</dt>
              <dd className="font-semibold text-slate-900">{data.grade || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400">Қала</dt>
              <dd className="font-semibold text-slate-900">{data.city || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400">Қызыққан курс</dt>
              <dd className="font-semibold text-slate-900">{data.interest || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-slate-400">Дереккөз</dt>
              <dd className="font-semibold text-slate-900">{data.source}</dd>
            </div>
          </dl>

          {data.note && (
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-bold text-slate-700">Ескерту:</span> {data.note}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <a
            href={`tel:${data.phone}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-3 text-sm font-bold text-white"
          >
            <Phone className="h-4 w-4" /> Қоңырау шалу
          </a>
          <a
            href={`https://wa.me/${data.phone.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:border-zerdeli-300"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          {data.email && (
            <a
              href={`mailto:${data.email}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:border-zerdeli-300"
            >
              <Mail className="h-4 w-4" /> Email жіберу
            </a>
          )}

          {data.converted_user_id ? (
            <div className="rounded-xl bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-700">
              ✓ Оқушыға айналдырылған
            </div>
          ) : (
            <button
              onClick={() => setModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 py-3 text-sm font-bold text-white"
            >
              <UserPlus className="h-4 w-4" /> Курсқа қосу / оқушы құру
            </button>
          )}
        </div>
      </div>

      {modal && (
        <EnrollModal
          mode="convert"
          leadId={id}
          leadName={data.name}
          onClose={() => setModal(false)}
          onDone={() => {
            setModal(false);
            router.push('/manager/students');
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
