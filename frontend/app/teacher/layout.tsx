'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { DashSidebar } from '@/components/DashSidebar'
import { RequireAuth } from '@/components/RequireAuth'
import { useAuth } from '@/lib/auth'
import {
  LayoutDashboard,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  BarChart3,
  Users,
  Settings,
  Table2,
} from 'lucide-react'

const ITEMS = [
  { href: '/teacher', label: 'Басты бет', Icon: LayoutDashboard, exact: true },
  { href: '/teacher/courses', label: 'Курстар мен сабақтар', Icon: BookOpen },
  { href: '/teacher/homework', label: 'Үй жұмыстары мен тесттер', Icon: ClipboardCheck },
  { href: '/teacher/grades', label: 'Бағалар журналы', Icon: Table2 },
  { href: '/teacher/students', label: 'Оқушылар', Icon: Users },
  { href: '/teacher/schedule', label: 'Кесте & эфирлер', Icon: CalendarClock },
  { href: '/teacher/analytics', label: 'Статистика & қаржы', Icon: BarChart3 },
  { href: '/teacher/settings', label: 'Баптаулар', Icon: Settings },
]

// The teacher cabinet is for real teachers only. ADMIN has its own mirror
// panel for editing course structure at /admin/courses/<id>, so ADMIN never
// needs to (and should not) land inside /teacher/* — bounce back to /admin.
function TeacherShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const isAdmin = user?.role === 'ADMIN'

  useEffect(() => {
    if (isAdmin) {
      router.replace('/admin')
    }
  }, [isAdmin, router])

  if (isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-zerdeli-500" />
        <span className="sr-only">Жүктелуде…</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashSidebar items={ITEMS} roleLabel="Мұғалім" />
      <div className="pt-14 lg:pt-0 lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  )
}

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="TEACHER">
      <TeacherShell>{children}</TeacherShell>
    </RequireAuth>
  )
}
