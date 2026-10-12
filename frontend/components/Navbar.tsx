'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { dashboardHrefFor } from '@/lib/api'
import { Logo } from '@/components/ui/Logo'
import { Menu, X, ChevronRight, LayoutDashboard, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { href: '#courses', label: 'Курстар' },
  { href: '#teachers', label: 'Мұғалімдер' },
  { href: '#why', label: 'Артықшылықтар' },
  { href: '#tariffs', label: 'ҰБТ пакеттері' },
]

export const Navbar: React.FC = () => {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const dashboardHref = dashboardHrefFor(user?.role)

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full border border-slate-200 bg-white/90 px-4 backdrop-blur-xl transition-all duration-300 sm:px-6 ${
          scrolled ? 'h-14 shadow-xl shadow-slate-300/30' : 'h-16 shadow-lg shadow-slate-200/40'
        }`}
      >
          <Link href="/" className="flex items-center">
            <Logo size="md" showText />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-9 text-sm font-medium lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="group relative py-1 text-slate-600 transition-colors hover:text-zerdeli-700"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 rounded-full bg-zerdeli-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:block">
            {user ? (
              <Link href={dashboardHref}>
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-zerdeli-500/25"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Менің кабинетім
                </motion.span>
              </Link>
            ) : (
              <Link href="/login">
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-zerdeli-500/25"
                >
                  <LogIn className="h-4 w-4" />
                  Логин
                </motion.span>
              </Link>
            )}
          </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700 md:hidden"
          aria-label="Меню"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-xl md:hidden"
          >
            <nav className="flex flex-col gap-1 text-sm font-medium">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-3 text-slate-700 transition-colors hover:bg-zerdeli-50 hover:text-zerdeli-700"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t border-slate-200 pt-4">
              {user ? (
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-3 text-center text-sm font-bold text-white shadow-lg"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Менің кабинетім
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-3 text-center text-sm font-bold text-white shadow-lg"
                >
                  <LogIn className="h-4 w-4" />
                  Логин
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
