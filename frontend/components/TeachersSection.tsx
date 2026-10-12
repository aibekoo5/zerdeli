'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

const TEACHERS = [
  {
    name: 'Асет Нұрғалиев',
    subject: 'Математика',
    photo:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80',
    exp: 15,
    blob: 'from-emerald-300 to-teal-300',
  },
  {
    name: 'Гүлнар Смағұлова',
    subject: 'Физика',
    photo:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80',
    exp: 12,
    blob: 'from-rose-300 to-pink-300',
  },
  {
    name: 'Ержан Қайратұлы',
    subject: 'Қазақ тілі',
    photo:
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=500&q=80',
    exp: 20,
    blob: 'from-sky-300 to-cyan-300',
  },
  {
    name: 'Айгерім Бекболатова',
    subject: 'Химия · Биология',
    photo:
      'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=500&q=80',
    exp: 10,
    blob: 'from-emerald-300 to-green-300',
  },
  {
    name: 'Данияр Оспанов',
    subject: 'Ағылшын тілі',
    photo:
      'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=500&q=80',
    exp: 8,
    blob: 'from-slate-700 to-zerdeli-900',
  },
  {
    name: 'Аружан Қасымова',
    subject: 'Тарих',
    photo:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80',
    exp: 11,
    blob: 'from-teal-300 to-emerald-300',
  },
]

const LIFT = [-18, 64, 34] // px — chip қиылысу биіктігінің зигзагы

function TeacherCard({ t, idx }: { t: (typeof TEACHERS)[number]; idx: number }) {
  const lift = LIFT[idx % LIFT.length]
  const zigzag = idx % 2 === 0 ? '-translate-y-4' : 'translate-y-4'
  return (
    <div className="relative w-[210px] shrink-0 pb-20 sm:w-[240px]">
      <div
        className={`relative ${zigzag} transition-transform duration-300 ease-out will-change-transform hover:z-10 hover:scale-[1.08]`}
      >
        {/* colour blob peeking from behind the photo */}
        <div
          className={`absolute -inset-2.5 rotate-3 rounded-[42%_58%_53%_47%/54%_41%_59%_46%] bg-gradient-to-br ${t.blob} opacity-95`}
          aria-hidden
        />
        <div className="relative aspect-[3/4.3] w-full overflow-hidden rounded-[26px] shadow-soft">
          <img
            src={t.photo}
            alt={t.name}
            draggable={false}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>

        <div
          className="absolute left-2.5 right-2.5 rounded-2xl bg-white px-3.5 py-2.5 text-left shadow-lg ring-1 ring-slate-100"
          style={{ bottom: lift }}
        >
          <div className="text-[13px] font-bold leading-tight text-zerdeli-900">{t.name}</div>
          <div className="mt-0.5 text-[11px] leading-snug text-slate-500">
            {t.subject} · {t.exp} жыл тәжірибе
          </div>
        </div>
      </div>
    </div>
  )
}

export const TeachersSection: React.FC = () => {
  const [paused, setPaused] = useState(false)
  const loop = [...TEACHERS, ...TEACHERS]

  return (
    <section id="teachers" className="relative overflow-hidden bg-white py-16 md:py-20">
      <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-zerdeli-100/60 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-xl"
        >
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Үздік ұстаздар
          </h2>
          <p className="mt-2 text-slate-600">
            Әрбір ұстаз — өз пәнінің маманы әрі жоғары балл алған түлектердің тәлімгері.
          </p>
        </motion.div>

        {/* endlessly, slowly drifting strip — bounded by the navbar's own edges, stops under the cursor, hovered card lifts */}
        <div
          className="teacher-marquee-fade relative mt-10 overflow-x-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex w-max animate-teacher-marquee gap-7 py-4"
            style={{ animationPlayState: paused ? 'paused' : 'running' }}
          >
            {loop.map((t, i) => (
              <TeacherCard key={`${t.name}-${i}`} t={t} idx={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
