'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Video, Clock, ExternalLink } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { teacherSchedule } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';

export default function TeacherSchedulePage() {
  const { data, loading, error, reload } = useApi<any[]>(teacherSchedule);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Кесте &amp; эфирлер</h1>
        <p className="mt-1 text-sm text-slate-500">Жоспарланған тікелей эфирлер мен сессиялар.</p>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyBlock title="Жоспарланған эфир жоқ" hint="Эфир қосу үшін әкімшіге хабарласыңыз." />}

      <div className="space-y-3">
        {(data || []).map((u, i) => {
          const start = new Date(u.starts_at);
          const soon = start.getTime() - Date.now() < 3 * 3600_000 && start.getTime() > Date.now();
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${soon ? 'bg-rose-50 text-rose-600' : 'bg-zerdeli-50 text-zerdeli-600'}`}>
                  <Video className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-900">{u.title}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" /> {start.toLocaleString('ru')} · {u.duration_minutes} мин · {u.platform}
                    {u.course_title && <span>· {u.course_title}</span>}
                  </div>
                </div>
              </div>
              {u.url && (
                <a
                  href={u.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white ${
                    soon ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-zerdeli-500 to-zerdeli-600'
                  }`}
                >
                  <ExternalLink className="h-3.5 w-3.5" /> {soon ? 'Эфирге кіру' : 'Сілтеме'}
                </a>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
