'use client'

import React from 'react'
import { DashSidebar } from '@/components/DashSidebar'
import { RequireAuth } from '@/components/RequireAuth'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Wallet,
  BarChart3,
  Settings,
} from 'lucide-react'

const ITEMS = [
  { href: '/admin', label: 'Басты бет', Icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Пайдаланушылар', Icon: Users },
  { href: '/admin/courses', label: 'Курстар', Icon: BookOpen },
  { href: '/admin/teachers', label: 'Мұғалімдер', Icon: GraduationCap },
  { href: '/admin/finance', label: 'Қаржы & төлемдер', Icon: Wallet },
  { href: '/admin/analytics', label: 'Аналитика', Icon: BarChart3 },
  { href: '/admin/settings', label: 'Баптаулар', Icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="ADMIN">
      <div className="min-h-screen bg-slate-50">
        <DashSidebar items={ITEMS} roleLabel="Әкімші" />
        <div className="pt-14 lg:pt-0 lg:pl-64">
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </RequireAuth>
  )
}
