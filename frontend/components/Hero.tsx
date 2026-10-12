'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from 'framer-motion'
import { ArrowRight, Play, Sparkles, Star } from 'lucide-react'
import { DotGlobe } from '@/components/DotGlobe'

const AVATARS = [
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=200&q=80',
]

const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.08, ease } }),
}

export const Hero: React.FC = () => {
  const ref = useRef<HTMLElement>(null)

  // cursor position in px (for the spotlight)
  const px = useMotionValue(-600)
  const py = useMotionValue(-600)
  const spx = useSpring(px, { stiffness: 160, damping: 28, mass: 0.3 })
  const spy = useSpring(py, { stiffness: 160, damping: 28, mass: 0.3 })
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${spx}px ${spy}px, rgba(16,185,129,0.20), rgba(45,212,191,0.10) 40%, transparent 68%)`

  // normalised position (for parallax on the blobs)
  const nx = useMotionValue(0)
  const ny = useMotionValue(0)
  const pnx = useSpring(nx, { stiffness: 60, damping: 18 })
  const pny = useSpring(ny, { stiffness: 60, damping: 18 })
  const blobAX = useTransform(pnx, [-0.5, 0.5], [40, -40])
  const blobAY = useTransform(pny, [-0.5, 0.5], [30, -30])
  const blobBX = useTransform(pnx, [-0.5, 0.5], [-50, 50])
  const blobBY = useTransform(pny, [-0.5, 0.5], [-24, 24])
  const gridX = useTransform(pnx, [-0.5, 0.5], [12, -12])
  const gridY = useTransform(pny, [-0.5, 0.5], [10, -10])

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    px.set(e.clientX - r.left)
    py.set(e.clientY - r.top)
    nx.set((e.clientX - r.left) / r.width - 0.5)
    ny.set((e.clientY - r.top) / r.height - 0.5)
  }
  function onLeave() {
    px.set(-600)
    py.set(-600)
    nx.set(0)
    ny.set(0)
  }

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative flex min-h-[88vh] items-center overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white pt-32 pb-24 md:pt-40 md:pb-32"
    >
      {/* ---------- animated interactive background ---------- */}
      {/* drifting blobs (also parallax with the cursor) */}
      <motion.div
        style={{ x: blobAX, y: blobAY }}
        aria-hidden
        className="pointer-events-none absolute -left-48 top-0 h-[32rem] w-[32rem] rounded-full bg-emerald-300/25 blur-[150px]"
      >
        <motion.div
          className="h-full w-full rounded-full bg-emerald-300/25"
          animate={{ scale: [1, 1.15, 1], opacity: [0.65, 1, 0.65] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      <motion.div
        style={{ x: blobBX, y: blobBY }}
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-16 h-[34rem] w-[34rem] rounded-full bg-teal-300/22 blur-[150px]"
      >
        <motion.div
          className="h-full w-full rounded-full bg-teal-300/22"
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[-10rem] left-1/2 h-[30rem] w-[36rem] -translate-x-1/2 rounded-full bg-zerdeli-400/18 blur-[150px]"
        animate={{ x: ['-50%', 'calc(-50% + 50px)', '-50%'], y: [0, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* logo-inspired rotating dot globe — reacts to the cursor */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[46%] h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 sm:h-[560px] sm:w-[560px] lg:h-[640px] lg:w-[640px]"
      >
        <motion.div
          style={{ x: gridX, y: gridY }}
          className="h-full w-full opacity-50 [mask-image:radial-gradient(circle,#000_55%,transparent_78%)] sm:opacity-[0.72]"
        >
          <DotGlobe className="h-full w-full" />
        </motion.div>
      </div>

      {/* faint parallax dot grid */}
      <motion.div style={{ x: gridX, y: gridY }} className="pointer-events-none absolute inset-0 bg-dotgrid opacity-60" aria-hidden />

      {/* cursor spotlight — the part that reacts to the mouse */}
      <motion.div style={{ background: spotlight }} className="pointer-events-none absolute inset-0" aria-hidden />

      {/* ---------- centered content ---------- */}
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 text-center sm:px-6">
        <motion.span
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="inline-flex items-center gap-2 rounded-full border border-zerdeli-200 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-zerdeli-700 shadow-soft backdrop-blur"
        >
          Ұзынағаштағы №1 дайындық орталығы
        </motion.span>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="mt-6 text-[2.3rem] font-black leading-[1.1] tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.04] md:text-7xl"
        >
          ҰБТ-да <span className="text-gradient-zerdeli">+45&nbsp;балл</span>
          <br /> нақты нәтижемен
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600"
        >
          NIS, BIL, РФМШ және ҰБТ-ға кешенді дайындық. Тәжірибелі мұғалімдер, жеке
          куратор, апталық сынақтар және грантқа кепілдік.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-9 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row"
        >
          <Link
            href="/login"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-7 py-4 text-sm font-bold text-white shadow-glow-emerald transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            Тегін сынақ сабаққа жазылу
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#courses"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-800 shadow-soft transition-colors hover:border-zerdeli-300 sm:w-auto"
          >
            <Play className="h-4 w-4 text-zerdeli-600" />
            Курстар каталогы
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-11 flex items-center gap-4"
        >
          <div className="flex -space-x-3">
            {AVATARS.map((a) => (
              <img key={a} src={a} alt="" className="h-9 w-9 rounded-full border-2 border-white object-cover" />
            ))}
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-zerdeli-500 text-[10px] font-bold text-white">
              +50
            </span>
          </div>
          <div className="text-left text-sm">
            <div className="flex items-center gap-1 font-bold text-slate-900">
              4.9 <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-slate-400">· 1 200+ түлек</span>
            </div>
            <div className="text-xs text-slate-500">95% грантқа түсті</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
