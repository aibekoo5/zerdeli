'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView, animate } from 'framer-motion'
import { Quote, Star, Play, ChevronLeft, ChevronRight } from 'lucide-react'

const REVIEWS = [
  {
    name: 'Телеген Данияр',
    result: 'ҰБТ · 128 балл',
    extra: 'КБТУ грант',
    gain: '+43 балл',
    photo:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80',
    quote:
      'Zerdeli-де қатемен жұмыс әдістемесі мен кураторымның күнделікті бақылауы нәтижемді 5 айда 85-тен 128 балға көтеруге көмектесті. Мұнда әр оқушыға жеке жоспар құрылады.',
  },
  {
    name: 'Аружан Қасымова',
    result: 'ҰБТ · 135 балл',
    extra: 'Медицина грант',
    gain: '+38 балл',
    photo:
      'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=900&q=80',
    quote:
      'Химия мен биологиядан нөлден бастадым. Апталық сынақтар мен куратордың кері байланысы арқасында мемлекеттік грантқа түстім.',
  },
  {
    name: 'Ерасыл Мұратов',
    result: 'NIS · қабылданды',
    extra: 'Математика 50/50',
    gain: '+29 балл',
    photo:
      'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=900&q=80',
    quote:
      'NIS-ке дайындалдым. Қысқа әрі нақты сабақтар мен логика тапсырмалары маған керемет көмектесті. Ұстаздар кез келген уақытта жауап берді.',
  },
  {
    name: 'Мадина Серік',
    result: 'ҰБТ · 131 балл',
    extra: 'ҚБТУ IT грант',
    gain: '+41 балл',
    photo:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80',
    quote:
      'Информатика мен математикадан жоғары балл жинадым. Zerdeli-дің тест тренажёрі нағыз ҰБТ-ға дәл ұқсас — емтиханда мүлдем қобалжымадым.',
  },
]

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => setVal(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to])

  return (
    <span ref={ref}>
      {val.toLocaleString('ru-RU')}
      {suffix}
    </span>
  )
}

const stats = [
  { to: 7, suffix: ' жыл', label: 'нарықтағы тәжірибе' },
  { to: 1240, suffix: '+', label: 'грантқа түскен түлек' },
  { to: 138, suffix: ' балл', label: 'орташа ҰБТ нәтижесі' },
  { to: 95, suffix: '%', label: 'мақсатына жеткендер' },
]

// логотиптегі жасыл моншақтардай бір түсті (однотонды) дөңгелек, кезек-кезек жоғары/төмен
function StatCircle({ s, idx, noLift }: { s: (typeof stats)[number]; idx: number; noLift?: boolean }) {
  const lifted = idx % 2 === 1
  return (
    <div className={`relative mx-auto ${noLift ? '' : lifted ? 'sm:-translate-y-12' : 'sm:translate-y-12'}`}>
      <div className="relative z-10 flex h-32 w-32 flex-col items-center justify-center rounded-full bg-zerdeli-500 text-center shadow-lg shadow-zerdeli-900/25 sm:h-40 sm:w-40 md:h-48 md:w-48">
        <div className="text-3xl font-black text-white sm:text-4xl md:text-[2.75rem]">
          <Counter to={s.to} suffix={s.suffix} />
        </div>
        <div className="mt-1.5 px-3 text-[11px] leading-snug text-zerdeli-50 sm:text-xs">{s.label}</div>
      </div>
    </div>
  )
}

export const SocialProof: React.FC = () => {
  const [idx, setIdx] = useState(0)
  const active = REVIEWS[idx]

  const go = (d: number) => setIdx((p) => (p + d + REVIEWS.length) % REVIEWS.length)

  return (
    <section id="social-proof" className="relative overflow-hidden bg-slate-50 py-24">
      {/* soft blobs */}
      <motion.div
        aria-hidden
        animate={{ y: [0, 24, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-zerdeli-200/40 blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Stat band — logo-дегі жасыл моншақ тізбегінің стилінде: скрайбл дөңгелектер, кезек-кезек биік/аласа */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative px-6 pt-4 pb-10 sm:px-10 sm:py-20"
        >
          {/* Mobile: vertical zigzag, top → bottom, connecting line down the middle */}
          <div className="relative flex flex-col items-center gap-16 sm:hidden">
            <svg
              width="200"
              height="704"
              viewBox="0 0 200 704"
              preserveAspectRatio="none"
              className="pointer-events-none absolute left-1/2 top-0 h-[704px] w-[200px] -translate-x-1/2 text-zerdeli-500"
              aria-hidden
            >
              <path
                d="M52,64 L148,256 L52,448 L148,640"
                fill="none"
                stroke="currentColor"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
            </svg>
            {stats.map((s, i) => (
              <motion.div
                key={s.label + '-mobile'}
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative z-10"
              >
                <div className={i % 2 === 0 ? '-translate-x-12' : 'translate-x-12'}>
                  <StatCircle s={s} idx={i} noLift />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop/tablet: horizontal zigzag, logo-дегідей жалғаушы тізбек сызығы */}
          <div className="relative hidden sm:block">
            <svg
              viewBox="0 0 400 120"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-x-10 top-1/2 h-24 w-[calc(100%-5rem)] -translate-y-1/2 text-zerdeli-500"
              aria-hidden
            >
              <path
                d="M20,95 L153,25 L285,95 L380,25"
                fill="none"
                stroke="currentColor"
                strokeWidth="9"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
            </svg>

            <div className="relative flex items-center justify-between gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                >
                  <StatCircle s={s} idx={i} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 max-w-xl"
        >
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Оқушыларымыздың пікірлері
          </h2>
          <p className="mt-3 text-slate-600">Нақты нәтижелер, нақты әңгімелер.</p>
        </motion.div>

        {/* Testimonial carousel */}
        <div className="mt-10 grid items-center gap-8 lg:grid-cols-[auto_360px_1fr] lg:gap-12">
          {/* Avatar selector */}
          <div className="flex flex-wrap items-center justify-center gap-4 lg:flex-col lg:justify-start">
            <div className="flex gap-4 lg:flex-col">
              {REVIEWS.map((r, i) => (
                <button
                  key={r.name}
                  onClick={() => setIdx(i)}
                  aria-label={r.name}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full transition-all ${
                    i === idx
                      ? 'ring-2 ring-zerdeli-500 ring-offset-2'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={r.photo} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex gap-2 lg:mt-2">
              <button
                onClick={() => go(-1)}
                aria-label="Артқа"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:border-zerdeli-400 hover:text-zerdeli-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Алға"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:border-zerdeli-400 hover:text-zerdeli-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Featured photo on blob */}
          <div className="relative mx-auto w-full max-w-[340px]">
            <div
              className="absolute inset-0 -z-0 scale-110 bg-gradient-to-br from-zerdeli-300 to-emerald-200"
              style={{ borderRadius: '48% 52% 42% 58% / 55% 45% 55% 45%' }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={active.name}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 overflow-hidden rounded-[36px] border-[6px] border-white shadow-2xl"
              >
                <img src={active.photo} alt={active.name} className="aspect-[4/5] w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
              </motion.div>
            </AnimatePresence>
            <button
              aria-label="Видео-пікірді қарау"
              className="absolute -bottom-5 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-white text-zerdeli-600 shadow-xl transition hover:scale-110"
            >
              <Play className="h-6 w-6 fill-zerdeli-600" />
            </button>
          </div>

          {/* Quote + meta */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.name + '-text'}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.4 }}
            >
              <Quote className="h-10 w-10 text-zerdeli-200" />
              <p className="mt-3 text-lg font-medium leading-relaxed text-slate-800 sm:text-xl">
                «{active.quote}»
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div>
                  <div className="text-base font-bold text-slate-900">{active.name}</div>
                  <div className="text-sm text-slate-500">
                    {active.result} · {active.extra}
                  </div>
                </div>
                <span className="rounded-full bg-zerdeli-50 px-3 py-1 text-sm font-black text-zerdeli-700">
                  {active.gain}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
