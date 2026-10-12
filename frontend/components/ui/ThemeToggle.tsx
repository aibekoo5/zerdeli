'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('dark')

  // Try to use ThemeContext, fallback to local state
  let theme = localTheme
  let toggleTheme = () => {
    const newTheme = localTheme === 'light' ? 'dark' : 'light'
    setLocalTheme(newTheme)
    localStorage.setItem('zerdeli-theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  try {
    const context = useTheme()
    theme = context.theme
    toggleTheme = context.toggleTheme
  } catch (e) {
    // ThemeProvider not available, use fallback
  }

  useEffect(() => {
    setMounted(true)
    // ThemeProvider owns the <html data-theme> attribute; only sync it here
    // when this toggle is used standalone (no provider).
    const savedTheme = localStorage.getItem('zerdeli-theme') as 'light' | 'dark' | null
    setLocalTheme(savedTheme || 'dark')
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10" />
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-lg
                 bg-slate-100 dark:bg-white/10
                 hover:bg-slate-200 dark:hover:bg-white/20
                 border border-slate-200 dark:border-white/10
                 text-slate-700 dark:text-slate-200
                 hover:text-zerdeli-600 dark:hover:text-zerdeli-400
                 transition-all duration-300 ease-in-out"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  )
}
