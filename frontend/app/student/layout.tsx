'use client'

import React from 'react'
import { DashSidebar } from '@/components/DashSidebar'
import { RequireAuth } from '@/components/RequireAuth'
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  ClipboardCheck,
  Settings,
  ShoppingBag,
  XCircle,
  Bell,
} from 'lucide-react'

const ITEMS = [
  { href: '/student', label: 'Басты бет', Icon: LayoutDashboard, exact: true },
  { href: '/student/courses', label: 'Курстарым', Icon: BookOpen },
  { href: '/student/catalog', label: 'Каталог', Icon: ShoppingBag },
  { href: '/student/tests', label: 'Тесттер мен үй тапсырмалары', Icon: ClipboardCheck },
  { href: '/student/mistakes', label: 'Қателермен жұмыс', Icon: XCircle },
  { href: '/student/analytics', label: 'Статистика & қаржы', Icon: BarChart3 },
  { href: '/student/notifications', label: 'Хабарламалар', Icon: Bell },
  { href: '/student/settings', label: 'Баптаулар', Icon: Settings },
]

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="STUDENT">
      <div className="min-h-screen bg-slate-50">
        <DashSidebar items={ITEMS} roleLabel="Оқушы" />
        <div className="pt-14 lg:pt-0 lg:pl-64">
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </RequireAuth>
  )
}
