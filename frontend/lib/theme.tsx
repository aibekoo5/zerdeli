'use client'

import React, { createContext, useContext, useEffect } from 'react'

// Zerdeli is a light-only product. This provider is kept as a thin no-op so
// existing `useTheme()` callers keep working, but there is no dark mode.
type Theme = 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    try {
      localStorage.removeItem('zerdeli-theme')
    } catch (e) {
      // ignore
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => {}, setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
