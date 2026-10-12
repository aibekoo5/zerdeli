'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Layers, PlayCircle, Wallet, Pencil } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { teacherCourses } from '@/lib/api';
import { LoadingBlock, ErrorBlock, EmptyBlock } from '@/components/ui/States';

export default function TeacherCoursesPage() {
  const { data, loading, error, reload } = useApi<any[]>(teacherCourses);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Курстар мен сабақтар</h1>
        <p className="mt-1 text-sm text-slate-500">Сіз жүргізетін курстар және олардың көрсеткіштері.</p>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} onRetry={reload} />}
      {data && data.length === 0 && <EmptyBlock title="Әзірше курс жоқ" hint="Жаңа курс қосу үшін әкімшіге хабарласыңыз." />}

      <div className="grid gap-6 md:grid-cols-2">
        {(data || []).map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white"
          >
            <div className="relative h-36">
              {c.cover_image && <img src={c.cover_image} alt="" className="h-full w-full object-cover" />}
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-zerdeli-700 backdrop-blur">
                {c.direction}
              </span>
              {!c.is_published && (
                <span className="absolute right-3 top-3 rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] font-bold text-white">
                  Жарияланбаған
                </span>
              )}
            </div>
            <div className="space-y-3 p-5">
              <h3 className="font-bold text-slate-900">{c.title}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-zerdeli-600" /> {c.students_count} оқушы</span>
                <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-amber-500" /> {c.modules_count} бөлім</span>
                <span className="flex items-center gap-1.5"><PlayCircle className="h-3.5 w-3.5 text-sky-500" /> {c.lessons_count} сабақ</span>
                <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-emerald-600" /> {Number(c.revenue).toLocaleString('ru')} ₸</span>
              </div>
              <Link
                href={`/teacher/courses/${c.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-2.5 text-xs font-bold text-white"
              >
                <Pencil className="h-3.5 w-3.5" /> Құрылымды өңдеу
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
