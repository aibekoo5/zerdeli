'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayCircle, CheckCircle2, ShoppingBag, GraduationCap } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { getMyCourses } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';

export default function StudentCoursesPage() {
  const { data, loading, error, reload } = useApi(getMyCourses);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Курстарым</h1>
          <p className="mt-1 text-sm text-slate-500">Сатып алынған және пакетпен ашылған курстар.</p>
        </div>
        <Link
          href="/student/catalog"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-zerdeli-300 hover:text-zerdeli-700"
        >
          <ShoppingBag className="h-4 w-4" /> Жаңа курс қосу
        </Link>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyBlock
          title="Курстар тізімі бос"
          hint="Каталогтан жеке курс сатып алыңыз немесе ҰБТ пакетін таңдаңыз — сонда барлық ҰБТ курстары ашылады."
          action={
            <Link
              href="/student/catalog"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-4 py-2 text-xs font-bold text-white"
            >
              <ShoppingBag className="h-4 w-4" /> Каталогқа өту
            </Link>
          }
        />
      )}

      {data && data.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {data.filter((c) => !c.is_finished).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
              >
                <div className="relative h-40">
                  {c.cover_image && <img src={c.cover_image} alt="" className="h-full w-full object-cover" />}
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-zerdeli-700 backdrop-blur">
                    {c.direction}
                  </span>
                  {c.via === 'subscription' && (
                    <span className="absolute right-3 top-3 rounded-full bg-violet-600/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                      Пакетпен
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900">{c.title}</h3>
                  <div className="mt-2 text-xs text-slate-500">{c.teacher_name || 'Zerdeli ұстазы'}</div>
                  <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">
                      {c.completed_lessons}/{c.total_lessons} сабақ
                    </span>
                    <span className="text-zerdeli-700">{c.progress_pct}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.progress_pct}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-zerdeli-400 to-zerdeli-600"
                    />
                  </div>
                  <Link
                    href={c.next_lesson_id ? `/student/player?course=${c.id}&lesson=${c.next_lesson_id}` : `/student/player?course=${c.id}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-2.5 text-xs font-bold text-white"
                  >
                    <PlayCircle className="h-4 w-4" /> Сабақты жалғастыру
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {data.some((c) => c.is_finished) && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Аяқталған курстар</h2>
              {data.filter((c) => c.is_finished).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                      <div className="text-xs text-slate-500">{c.total_lessons} сабақ аяқталды</div>
                    </div>
                  </div>
                  <Link
                    href={`/student/player?course=${c.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-zerdeli-300"
                  >
                    <GraduationCap className="h-3.5 w-3.5" /> Қайталау
                  </Link>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
