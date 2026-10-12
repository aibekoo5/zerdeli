'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Star, Users, Check, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { getCourses, getPackages, Course, Package } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';
import { CheckoutModal, CheckoutItem } from '@/components/CheckoutModal';

const DIRECTIONS = [
  { id: 'ALL', label: 'Барлығы' },
  { id: 'UNT', label: 'ҰБТ' },
  { id: 'NIS', label: 'NIS' },
  { id: 'BIL', label: 'BIL' },
];

export default function StudentCatalogPage() {
  const router = useRouter();
  const courses = useApi(() => getCourses());
  const packages = useApi(getPackages);

  const [dir, setDir] = useState('ALL');
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'packages' | 'courses'>('packages');
  const [checkoutItem, setCheckoutItem] = useState<CheckoutItem | null>(null);

  const filtered = useMemo(() => {
    const list = courses.data || [];
    return list.filter(
      (c) =>
        (dir === 'ALL' || c.direction === dir) &&
        (c.title.toLowerCase().includes(q.toLowerCase()) || c.subject.toLowerCase().includes(q.toLowerCase())),
    );
  }, [courses.data, dir, q]);

  const onSuccess = () => {
    setCheckoutItem(null);
    router.push('/student/courses');
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Каталог</h1>
        <p className="mt-1 text-sm text-slate-500">ҰБТ пакетін немесе жеке курсты таңдап, бірден бастаңыз.</p>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold sm:w-fit">
        {(['packages', 'courses'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-4 py-2 transition-colors sm:flex-none ${
              tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
          >
            {t === 'packages' ? 'ҰБТ пакеттері' : 'Жеке курстар'}
          </button>
        ))}
      </div>

      {tab === 'packages' && (
        <>
          {packages.loading && <LoadingBlock />}
          {packages.error && <ErrorBlock message={packages.error} onRetry={packages.reload} />}
          {packages.data && (
            <div className="grid gap-6 lg:grid-cols-3">
              {packages.data.map((p: Package) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col rounded-3xl border bg-white p-6 ${
                    p.is_popular ? 'border-2 border-zerdeli-400 shadow-xl shadow-zerdeli-500/10' : 'border-slate-200'
                  }`}
                >
                  {p.badge && (
                    <span className="mb-3 w-fit rounded-full bg-gradient-to-r from-zerdeli-600 to-zerdeli-500 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                      {p.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{p.subtitle}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">{p.price.toLocaleString('ru')} ₸</span>
                    <span className="text-xs text-slate-500">/ ай</span>
                  </div>
                  <div className="mt-1 text-[11px] font-bold text-slate-500">
                    <span className="text-[#F14635]">Kaspi 0-0-12:</span> {p.kaspi_month.toLocaleString('ru')} ₸ / ай
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    {p.features.slice(0, 5).map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setCheckoutItem({ kind: 'package', id: p.id, title: p.name, price: p.price, kaspiMonth: p.kaspi_month })
                    }
                    className="mt-6 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-3 text-sm font-bold text-white"
                  >
                    Пакетті таңдау
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'courses' && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Пән немесе тақырып..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-zerdeli-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              {DIRECTIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDir(d.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                    dir === d.id ? 'bg-zerdeli-600 text-white' : 'border border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {courses.loading && <LoadingBlock />}
          {courses.error && <ErrorBlock message={courses.error} onRetry={courses.reload} />}
          {courses.data && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c: Course) => {
                const price = c.discount_price || c.price;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white"
                  >
                    <div className="relative h-40">
                      <img src={c.cover_image} alt="" className="h-full w-full object-cover" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-zerdeli-700 backdrop-blur">
                        {c.subject}
                      </span>
                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-amber-600 backdrop-blur">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {c.rating}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-bold text-slate-900 line-clamp-2">{c.title}</h3>
                      <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{c.description}</p>
                      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> {c.total_students.toLocaleString('ru')}
                        </span>
                        <span>· {c.teacher?.full_name || 'Zerdeli ұстазы'}</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div>
                          {c.discount_price && (
                            <div className="text-[11px] text-slate-400 line-through">{c.price.toLocaleString('ru')} ₸</div>
                          )}
                          <div className="text-lg font-black text-slate-900">{price.toLocaleString('ru')} ₸</div>
                        </div>
                        {c.is_enrolled ? (
                          <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Сатып алынды
                          </span>
                        ) : c.is_accessible ? (
                          <span className="flex items-center gap-1.5 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">
                            <Sparkles className="h-3.5 w-3.5" /> Пакетпен ашық
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              setCheckoutItem({
                                kind: 'course',
                                id: c.id,
                                title: c.title,
                                price,
                                kaspiMonth: Math.round(price / 12),
                              })
                            }
                            className="rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-4 py-2 text-xs font-bold text-white"
                          >
                            Сатып алу
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      <CheckoutModal item={checkoutItem} onClose={() => setCheckoutItem(null)} onSuccess={onSuccess} />
    </div>
  );
}
