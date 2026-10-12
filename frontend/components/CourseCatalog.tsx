'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, Users, X, PlayCircle, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getCourses, Course } from '@/lib/api';

const FALLBACK: Course[] = [
  {
    id: 'f1',
    title: 'Zerdeli: Математикалық сауаттылық (20/20 балл)',
    description: '140 баллға жетудің басты фундаменті. Логика, жылдам шығару лайфхактары, мәтіндік және диаграммалық есептер.',
    cover_image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    direction: 'UNT', subject: 'Мат.сауаттылық', level: '140 балл', price: 24900, discount_price: 16900,
    rating: 4.98, total_students: 4820, modules: [],
  },
  {
    id: 'f2',
    title: 'Zerdeli: Қазақстан тарихы (Жаңа 2026 базасы)',
    description: 'ҰТО-ның ең соңғы нақты тест базасы бойынша толық курс. Хронология, реформалар және картамен жұмыс.',
    cover_image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80',
    direction: 'UNT', subject: 'Қазақстан тарихы', level: 'Барлық деңгей', price: 24900, discount_price: 15900,
    rating: 4.96, total_students: 3910, modules: [],
  },
  {
    id: 'f3',
    title: 'NIS (Назарбаев Мектептеріне) Толық Дайындық',
    description: '5-6 сыныптар үшін: математика, сандық сипаттамалар, кеңістіктік ойлау және тілдік қабілеттер.',
    cover_image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    direction: 'NIS', subject: 'NIS Арнайы', level: '5-6 сынып', price: 32900, discount_price: 22900,
    rating: 4.95, total_students: 2150, modules: [],
  },
];

const TABS = [
  { id: 'ALL', label: 'Барлық курстар' },
  { id: 'UNT', label: 'ҰБТ 140 Балл' },
  { id: 'NIS', label: 'NIS (НЗМ)' },
  { id: 'BIL', label: 'BIL (Лицей)' },
];

export const CourseCatalog: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>(FALLBACK);
  const [dir, setDir] = useState('ALL');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Course | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getCourses()
      .then((d) => {
        if (d && d.length) setCourses(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setShowAll(false);
  }, [dir, q]);

  const ctaHref = user ? '/student/catalog' : '/login';

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          (dir === 'ALL' || c.direction === dir) &&
          (c.title.toLowerCase().includes(q.toLowerCase()) || c.subject.toLowerCase().includes(q.toLowerCase())),
      ),
    [courses, dir, q],
  );

  return (
    <section id="courses" className="relative bg-slate-50 py-24">
      <div className="pointer-events-none absolute right-0 top-1/4 h-[420px] w-[420px] rounded-full bg-zerdeli-500/10 blur-[140px]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">Курстар және бағалары</h2>
            <p className="text-base text-slate-600">
              Әр бағыт бойынша жеке курс — сапалы бейнесабақтар, интерактивті тестілер және куратор бақылауы.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Пән немесе тақырып..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:border-zerdeli-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-10 flex flex-wrap gap-2.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setDir(t.id)}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition-all ${
                dir === t.id
                  ? 'bg-gradient-to-r from-zerdeli-600 to-zerdeli-500 text-white shadow-lg shadow-zerdeli-500/25'
                  : 'border border-slate-200/70 bg-white text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course, ci) => {
            const price = course.discount_price || course.price;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: (ci % 3) * 0.08 }}
                className={`group ${!showAll && ci >= 3 ? 'hidden md:flex' : 'flex'} flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white transition-shadow duration-300 hover:shadow-2xl hover:shadow-slate-200/70`}
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img src={course.cover_image} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute left-3 top-3 flex gap-2">
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-zerdeli-700 backdrop-blur-md">{course.subject}</span>
                    </div>
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-amber-600 backdrop-blur-md">
                      <Star className="h-3.5 w-3.5 fill-amber-500" /> {course.rating}
                    </div>
                  </div>
                  <div className="space-y-3.5 p-6">
                    <h3 className="text-base font-bold leading-snug text-slate-900 line-clamp-2 group-hover:text-zerdeli-700 sm:text-lg">{course.title}</h3>
                    <p className="text-xs leading-relaxed text-slate-500 line-clamp-2">{course.description}</p>
                    {course.teacher && (
                      <div className="flex items-center gap-3 pt-1">
                        {course.teacher.avatar_url && (
                          <img src={course.teacher.avatar_url} alt="" className="h-8 w-8 rounded-full border border-zerdeli-400/40 object-cover" />
                        )}
                        <div className="text-xs">
                          <p className="font-semibold text-slate-900">{course.teacher.full_name}</p>
                          <p className="text-[10px] font-medium text-zerdeli-600">Zerdeli ұстазы</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 border-t border-slate-200/70 pt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-zerdeli-600" /> {course.total_students.toLocaleString('ru')} оқушы
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-500" /> {course.modules?.length || 2}+ модуль
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-[11px] font-semibold text-red-500">
                      <span>Kaspi 0-0-12 арқылы:</span>
                      <strong className="font-bold text-slate-900">{Math.round(price / 12).toLocaleString('ru')} ₸ / ай</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-slate-200/70 p-6 pt-4">
                  <div>
                    {course.discount_price && <div className="text-[11px] text-slate-400 line-through">{course.price.toLocaleString('ru')} ₸</div>}
                    <div className="text-lg font-black text-slate-900">{price.toLocaleString('ru')} ₸</div>
                  </div>
                  <button
                    onClick={() => setSelected(course)}
                    className="rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-4 py-2.5 text-xs font-bold text-white shadow-md"
                  >
                    Бағдарламаны көру
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length > 3 && (
          <div className="mt-8 flex justify-center md:hidden">
            {!showAll ? (
              <button
                onClick={() => setShowAll(true)}
                className="rounded-xl border border-zerdeli-500/30 bg-white px-6 py-3 text-xs font-bold text-zerdeli-700 shadow-sm"
              >
                Барлығын көрсету
              </button>
            ) : (
              <button
                onClick={() => setShowAll(false)}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-600 shadow-sm"
              >
                Жасыру
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-h-[85vh] w-full max-w-2xl space-y-6 overflow-y-auto rounded-3xl border border-zerdeli-500/30 bg-white p-6 shadow-2xl sm:p-8"
            >
              <button onClick={() => setSelected(null)} className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
              <div className="space-y-2">
                <span className="rounded-full bg-zerdeli-50 px-2.5 py-1 text-xs font-bold text-zerdeli-700">{selected.subject}</span>
                <h3 className="text-xl font-black text-slate-900 sm:text-2xl">{selected.title}</h3>
                <p className="text-xs leading-relaxed text-slate-600">{selected.description}</p>
              </div>
              {selected.modules && selected.modules.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Оқу бағдарламасы:</h4>
                  {selected.modules.map((m) => (
                    <div key={m.id} className="space-y-2.5 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                        <span>{m.title}</span>
                        <span className="text-slate-500">{m.lessons.length} сабақ</span>
                      </div>
                      <div className="space-y-1.5 border-l border-zerdeli-500/30 pl-2">
                        {m.lessons.map((l) => (
                          <div key={l.id} className="flex items-center justify-between text-xs text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <PlayCircle className="h-3.5 w-3.5 text-zerdeli-600" /> {l.title}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500">{l.duration_minutes} мин</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-4 sm:flex-row">
                <div>
                  <span className="text-xs text-slate-500">Курс құны:</span>
                  <div className="text-xl font-black text-slate-900">{(selected.discount_price || selected.price).toLocaleString('ru')} ₸</div>
                </div>
                <Link
                  href={ctaHref}
                  onClick={() => setSelected(null)}
                  className="w-full rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-6 py-2.5 text-center text-xs font-bold text-white sm:w-auto"
                >
                  {user ? 'Сатып алу' : 'Кіру де сатып алу'}
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
