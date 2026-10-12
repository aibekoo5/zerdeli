'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, ExternalLink, Menu, X, ShieldCheck, LucideIcon } from 'lucide-react'

export interface DashNavItem {
  href: string
  label: string
  Icon: LucideIcon
  exact?: boolean
}

const ROLE_STYLE: Record<string, string> = {
  Оқушы: 'bg-zerdeli-50 text-zerdeli-700 ring-zerdeli-200',
  Мұғалім: 'bg-sky-50 text-sky-700 ring-sky-200',
  Куратор: 'bg-teal-50 text-teal-700 ring-teal-200',
  Әкімші: 'bg-rose-50 text-rose-700 ring-rose-200',
  Менеджер: 'bg-violet-50 text-violet-700 ring-violet-200',
}

function RoleBadge({ label, className = '' }: { label: string; className?: string }) {
  const style = ROLE_STYLE[label] || 'bg-slate-100 text-slate-700 ring-slate-200'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-black uppercase tracking-wide ring-1 ring-inset ${style} ${className}`}
    >
      <ShieldCheck className="h-4 w-4" />
      {label}
    </span>
  )
}

function NavList({ items, onNavigate }: { items: DashNavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map(({ href, label, Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-zerdeli-50 text-zerdeli-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Icon
              className={`h-[18px] w-[18px] shrink-0 ${
                active ? 'text-zerdeli-600' : 'text-slate-400 group-hover:text-slate-600'
              }`}
            />
            <span className="leading-tight">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function Footer({ subtitle }: { subtitle: string }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  return (
    <div className="mt-auto space-y-3 border-t border-slate-200 pt-4">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-zerdeli-500 to-zerdeli-600 text-sm font-bold text-white">
          {user?.full_name?.charAt(0) || 'U'}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-slate-900">
            {user?.full_name || 'Қонақ'}
          </div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      >
        <ExternalLink className="h-[18px] w-[18px]" />
        Сайтқа оралу
      </Link>
      <button
        onClick={() => {
          logout()
          router.push('/login')
        }}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50"
      >
        <LogOut className="h-[18px] w-[18px]" />
        Шығу
      </button>
    </div>
  )
}

export function DashSidebar({
  items,
  roleLabel,
}: {
  items: DashNavItem[]
  roleLabel: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex">
        <Link href="/" className="flex items-center gap-2.5 px-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/zerdeli-logo.jpg"
            alt="Zerdeli"
            className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
          />
          <span className="text-lg font-extrabold tracking-tight text-slate-900">Zerdeli</span>
        </Link>
        <div className="mb-7 mt-4 px-1">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Кабинет</div>
          <RoleBadge label={roleLabel} />
        </div>
        <NavList items={items} />
        <Footer subtitle={roleLabel} />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/zerdeli-logo.jpg"
            alt="Zerdeli"
            className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
          />
          <RoleBadge label={roleLabel} className="!py-1 !text-xs" />
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700"
          aria-label="Меню"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between px-1">
                <RoleBadge label={roleLabel} />
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                  aria-label="Жабу"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavList items={items} onNavigate={() => setOpen(false)} />
              <Footer subtitle={roleLabel} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
