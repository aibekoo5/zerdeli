'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, X, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getPackages, Package } from '@/lib/api'

const ease = [0.22, 1, 0.36, 1] as const

const FALLBACK: Package[] = [
  {
    id: 's', code: 'standard', name: 'ҰБТ Стандарт', subtitle: 'Өздігінен сапалы дайындық', tier: 'standard',
    price: 19900, kaspi_month: 1658, duration_days: 30, is_popular: false, badge: null, order_index: 1,
    features: [
      'Барлық бейнесабақтарға шексіз қолжетімділік',
      '10–30 минуттық сабақ конспектілері',
      'Әр тақырып бойынша бекіту тесттері',
      'Апталық ҰТО форматындағы байқау сынағы',
    ],
    not_included: ['Жеке кураторлық бақылау 24/7', 'Қатемен жеке бейне-жұмыс'],
  },
  {
    id: 'p', code: 'pro', name: 'ҰБТ PRO', subtitle: '140 баллға жетудің ең танымал пакеті', tier: 'pro',
    price: 29900, kaspi_month: 2490, duration_days: 30, is_popular: true, badge: 'ЕҢ ТАҢДАУЛЫ', order_index: 2,
    features: [
      'Стандарт пакетінің барлық мүмкіндігі',
      '140 балл алған жеке куратор (24/7)',
      'Қатемен жұмыс: әр қатеге бейне-талдау',
      'Күнделікті үй жұмысын қадағалау',
    ],
    not_included: ['Бас оқытушымен 1-on-1 Zoom сессиялар'],
  },
  {
    id: 'v', code: 'vip', name: 'ҰБТ VIP', subtitle: 'Грантқа 100% заңды кепілдікпен', tier: 'vip',
    price: 49900, kaspi_month: 4158, duration_days: 30, is_popular: false, badge: 'ГРАНТ КЕПІЛІ', order_index: 3,
    features: [
      'PRO пакетінің барлық мүмкіндігі',
      'Бас сарапшы ұстазбен апталық 1-on-1',
      'Мемлекеттік грантқа 100% заңды кепілдік',
      'ЖОО-ға құжат тапсыруда сүйемелдеу',
    ],
    not_included: [],
  },
]

export const TariffPlans: React.FC = () => {
  const { user } = useAuth()
  const [plans, setPlans] = useState<Package[]>(FALLBACK)

  useEffect(() => {
    getPackages().then((d) => d && d.length && setPlans(d)).catch(() => {})
  }, [])

  const ctaHref = user ? '/student/catalog' : '/login'

  return (
    <section id="tariffs" className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/50 to-white py-20 md:py-28">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[50rem] -translate-x-1/2 rounded-full bg-zerdeli-400/15 blur-[150px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-zerdeli-600">Пакеттер</span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            ҰБТ-ға дайындық пакеттері
          </h2>
          <p className="mt-3 text-slate-600">
            Толық жылдық бағдарлама. Жеке пәндік курстардың бағасын{' '}
            <a href="#courses" className="font-semibold text-zerdeli-700 hover:underline">каталогтан</a>{' '}
            көресіз · Kaspi 0-0-12 бөліп төлеу.
          </p>
        </div>

        {/* pricing grid — equal-height cards */}
        <div className="mt-14 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3 lg:gap-7">
          {plans.map((plan, idx) => {
            const popular = plan.is_popular
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease }}
                className={`relative flex h-full flex-col overflow-hidden rounded-3xl bg-white p-7 sm:p-8 ${
                  popular
                    ? 'ring-2 ring-zerdeli-500 shadow-glow-emerald'
                    : 'border border-slate-200 shadow-soft'
                }`}
              >
                {/* accent bar on the popular card — inside the card, no overlap */}
                {popular && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-zerdeli-400 to-zerdeli-600" />}

                {/* badge — its own line, left-aligned, so any length is safe */}
                {plan.badge && (
                  <span
                    className={`mb-3 inline-flex w-fit max-w-full items-center gap-1 truncate rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                      plan.tier === 'vip' ? 'bg-amber-100 text-amber-700' : 'bg-zerdeli-600 text-white'
                    }`}
                  >
                    {plan.tier === 'vip' ? <ShieldCheck className="h-3 w-3 shrink-0" /> : <Sparkles className="h-3 w-3 shrink-0" />}
                    <span className="truncate">{plan.badge}</span>
                  </span>
                )}

                <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{plan.subtitle}</p>

                {/* price */}
                <div className="mt-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black tracking-tight text-slate-900">
                      {plan.price.toLocaleString('ru')}
                    </span>
                    <span className="text-lg font-bold text-slate-400">₸</span>
                    <span className="text-sm font-medium text-slate-400">/ айына</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold">
                    <span className="text-[#F14635]">Kaspi 0-0-12</span>
                    <span className="text-slate-700">{plan.kaspi_month.toLocaleString('ru')} ₸ / ай</span>
                  </div>
                </div>

                {/* features — grows to equalise card heights */}
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zerdeli-100 text-zerdeli-700">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span className="leading-snug text-slate-700">{f}</span>
                    </li>
                  ))}
                  {plan.not_included.map((f, i) => (
                    <li key={`x${i}`} className="flex items-start gap-2.5 text-slate-400">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <X className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span className="leading-snug line-through">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA — pinned to the bottom, inside the card */}
                <Link
                  href={ctaHref}
                  className={`group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5 ${
                    popular
                      ? 'bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 text-white shadow-lg shadow-zerdeli-500/25'
                      : 'border border-slate-200 bg-white text-slate-900 hover:border-zerdeli-300'
                  }`}
                >
                  Осы тарифті таңдау
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            )
          })}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Барлық пакетте 3 күндік ақшаны қайтару кепілдігі · шартсыз бас тарту
        </p>
      </div>
    </section>
  )
}
