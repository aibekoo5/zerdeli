'use client'

import React, { useRef, useState } from 'react'
import { motion, useAnimationFrame } from 'framer-motion'
import {
  Users, ClipboardCheck, ShieldCheck, RefreshCw, Clock, Smartphone,
  BellRing, TrendingUp, ChevronLeft, ChevronRight,
} from 'lucide-react'

type Item = {
  icon: React.ComponentType<{ className?: string }>
  tint: string
  title: string
  text: string
  stat?: string
  photo: string
}

const ITEMS: Item[] = [
  {
    icon: Users,
    tint: 'bg-white/90 text-emerald-600',
    title: 'Жеке куратор 24/7',
    text: 'Жоғары балл алған тәлімгер бекітіледі. Ата-анаға апталық есеп.',
    stat: 'Орташа жауап ~4 мин',
    photo: 'photo-1522202176988-66273c2fd55f',
  },
  {
    icon: ClipboardCheck,
    tint: 'bg-white/90 text-amber-600',
    title: 'Апталық ҰБТ сынағы',
    text: 'ҰТО-ның нақты интерфейсінде байқау сынақ пен балл динамикасы.',
    stat: 'Әр аптада жаңа нұсқа',
    photo: 'photo-1571260899304-425eee4c7efc',
  },
  {
    icon: ShieldCheck,
    tint: 'bg-white/90 text-teal-600',
    title: 'Грантқа кепілдік',
    text: 'Талаптарды орындаған оқушыға мемлекеттік грантқа кепілдік.',
    stat: '95% түлек грантқа түсті',
    photo: 'photo-1541339907198-e08756dedf3f',
  },
  {
    icon: RefreshCw,
    tint: 'bg-white/90 text-rose-600',
    title: 'Қатемен жұмыс',
    text: 'Әр қате сұраққа бейне-талдау. Тақырып бекімей жаңа сабақ ашылмайды.',
    photo: 'photo-1513258496099-48168024aec0',
  },
  {
    icon: Clock,
    tint: 'bg-white/90 text-sky-600',
    title: '10–30 мин сабақтар',
    text: 'Сусыз, тек ҰБТ-да келетін тактикалар. Уақытыңды 3 есе үнемдейсің.',
    photo: 'photo-1501139083538-0139583c060f',
  },
  {
    icon: Smartphone,
    tint: 'bg-white/90 text-violet-600',
    title: 'Мобильді қосымша',
    text: 'iOS және Android. Кез келген жерде тест тапсыр, сабақ қара.',
    photo: 'photo-1522204523234-8729aa6e3d5f',
  },
  {
    icon: BellRing,
    tint: 'bg-white/90 text-indigo-600',
    title: 'Ескертпелер жүйесі',
    text: 'Дедлайн, жаңа сабақ және сынақ нәтижесі туралы бірден хабарлама.',
    photo: 'photo-1611746872915-64382b5c76da',
  },
  {
    icon: TrendingUp,
    tint: 'bg-white/90 text-emerald-600',
    title: 'Прогресс аналитикасы',
    text: 'Әр пән бойынша өсу графигі, әлсіз тақырыптар және болжам балл.',
    stat: '5 айда орташа +45 балл',
    photo: 'photo-1551288049-bebda4e38f71',
  },
]

const MAX_VISIBLE = 2
const STEP_MS = 1500 // бір карточка ауысу аралығы (мыш ұсталып тұрғанда)

function wrapOffset(raw: number, n: number) {
  let o = ((raw % n) + n) % n
  if (o > n / 2) o -= n
  return o
}

const FanCarousel: React.FC = () => {
  const n = ITEMS.length
  const dirRef = useRef<0 | 1 | -1>(0)
  const lastStepRef = useRef<number | null>(null)
  const [index, setIndex] = useState(0)

  useAnimationFrame((time) => {
    if (dirRef.current === 0) {
      lastStepRef.current = null
      return
    }
    if (lastStepRef.current === null || time - lastStepRef.current >= STEP_MS) {
      lastStepRef.current = time
      const d = dirRef.current
      setIndex((v) => (v + d + n) % n)
    }
  })

  const setDir = (d: 0 | 1 | -1) => {
    dirRef.current = d
  }

  return (
    <div className="mt-12">
      <div
        className="relative isolate mx-auto h-[400px] max-w-5xl select-none sm:h-[460px]"
        onMouseLeave={() => setDir(0)}
      >
        {/* left hover zone */}
        <div
          className="group absolute inset-y-0 left-0 z-30 flex w-[32%] cursor-w-resize items-center justify-start pl-1"
          onMouseEnter={() => setDir(-1)}
          onMouseLeave={() => setDir(0)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500 opacity-0 shadow-soft ring-1 ring-slate-200 transition group-hover:opacity-100 group-hover:text-zerdeli-600">
            <ChevronLeft className="h-5 w-5" />
          </span>
        </div>
        {/* right hover zone */}
        <div
          className="group absolute inset-y-0 right-0 z-30 flex w-[32%] cursor-e-resize items-center justify-end pr-1"
          onMouseEnter={() => setDir(1)}
          onMouseLeave={() => setDir(0)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500 opacity-0 shadow-soft ring-1 ring-slate-200 transition group-hover:opacity-100 group-hover:text-zerdeli-600">
            <ChevronRight className="h-5 w-5" />
          </span>
        </div>

        {ITEMS.map((it, i) => {
          const Icon = it.icon
          const offset = wrapOffset(i - index, n)
          const abs = Math.abs(offset)
          const visible = abs <= MAX_VISIBLE
          const scale = abs === 0 ? 1.18 : abs === 1 ? 0.88 : 0.72
          const z = 20 - abs * 4
          const gray = Math.min(abs / MAX_VISIBLE, 1)
          const blur = abs === 0 ? 0 : abs === 1 ? 1.5 : 2.5

          return (
            <div
              key={it.title}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[230px] transition-[transform,opacity,filter] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-[380px] sm:w-[260px]"
              style={{
                zIndex: z,
                opacity: visible ? 1 - gray * 0.1 : 0,
                transform: `translate(-50%, -50%) translateX(calc(${offset} * clamp(112px, 20vw, 214px))) scale(${scale})`,
                filter: `grayscale(${gray}) blur(${blur}px)`,
              }}
            >
              <article
                className={`relative h-full w-full overflow-hidden rounded-2xl border border-white/20 bg-zerdeli-950 ${
                  abs === 0 ? 'shadow-xl shadow-zerdeli-950/30' : 'shadow-soft'
                }`}
              >
                <img
                  src={`https://images.unsplash.com/${it.photo}?auto=format&fit=crop&w=500&q=80`}
                  alt={it.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
                {/* bottom-up fade so the text zone stays readable, photo itself stays natural */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

                <div className="relative flex h-full flex-col p-5">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-soft backdrop-blur ${it.tint}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="mt-auto rounded-xl bg-zerdeli-950/55 p-3 backdrop-blur-md ring-1 ring-white/10">
                    <h3 className="text-[15px] font-bold text-white">{it.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/85">{it.text}</p>
                    {it.stat && (
                      <div className="mt-3 inline-flex w-fit items-center rounded-lg bg-white/15 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
                        {it.stat}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const WhyZerdeli: React.FC = () => {
  return (
    <section
      id="why"
      className="relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/60 to-white py-20 md:py-28"
    >
      <div
        className="pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-zerdeli-300/25 blur-[130px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-amber-200/30 blur-[130px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zerdeli-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zerdeli-700">
            Артықшылықтар
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Zerdeli-дің басты артықшылықтары
          </h2>
          <p className="mt-3 text-slate-600">Ата-аналар мен оқушылар бізді таңдайтын себептер.</p>
        </motion.div>

        <FanCarousel />
      </div>
    </section>
  )
}
