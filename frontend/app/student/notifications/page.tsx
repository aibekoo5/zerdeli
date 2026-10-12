'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, TrendingUp, ClipboardCheck, PlayCircle, CreditCard, MessageSquare, Info,
} from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { getNotifications, markNotificationsRead } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';

const ICON: Record<string, { Icon: typeof Bell; tint: string }> = {
  test_result: { Icon: ClipboardCheck, tint: 'bg-amber-50 text-amber-600' },
  achievement: { Icon: TrendingUp, tint: 'bg-emerald-50 text-emerald-600' },
  lesson: { Icon: PlayCircle, tint: 'bg-zerdeli-50 text-zerdeli-600' },
  payment: { Icon: CreditCard, tint: 'bg-violet-50 text-violet-600' },
  curator: { Icon: MessageSquare, tint: 'bg-sky-50 text-sky-600' },
  info: { Icon: Info, tint: 'bg-slate-100 text-slate-500' },
};

function ago(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'жаңа ғана';
  if (h < 24) return `${h} сағат бұрын`;
  const d = Math.floor(h / 24);
  return `${d} күн бұрын`;
}

export default function StudentNotificationsPage() {
  const { data, loading, error, reload } = useApi(getNotifications);

  useEffect(() => {
    markNotificationsRead().catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Хабарламалар</h1>
        <p className="mt-1 text-sm text-slate-500">Куратор хабарлары, тест нәтижелері, жаңа сабақтар мен төлемдер.</p>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyBlock title="Хабарлама жоқ" hint="Жаңа хабарламалар осында пайда болады." />}

      <div className="space-y-2">
        {(data || []).map((n, i) => {
          const cfg = ICON[n.type] || ICON.info;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className={`flex gap-3 rounded-2xl border p-4 ${
                n.is_read ? 'border-slate-200 bg-white' : 'border-zerdeli-200 bg-zerdeli-50/40'
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.tint}`}>
                <cfg.Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-slate-900">{n.title}</div>
                  <div className="shrink-0 text-[11px] text-slate-400">{ago(n.created_at)}</div>
                </div>
                <div className="mt-0.5 text-sm text-slate-600">{n.message}</div>
              </div>
              {!n.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-zerdeli-500" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
