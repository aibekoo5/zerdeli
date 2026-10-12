'use client'

import React from 'react'
import { DashSidebar } from '@/components/DashSidebar'
import { RequireAuth } from '@/components/RequireAuth'
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Wallet,
  CalendarClock,
  Settings,
} from 'lucide-react'

const ITEMS = [
  { href: '/manager', label: 'Басты бет', Icon: LayoutDashboard, exact: true },
  { href: '/manager/leads', label: 'Өтінімдер & лидтер', Icon: UserPlus },
  { href: '/manager/students', label: 'Оқушылар', Icon: Users },
  { href: '/manager/payments', label: 'Төлемдер & қарыздар', Icon: Wallet },
  { href: '/manager/trials', label: 'Сынақ сабақтар', Icon: CalendarClock },
  { href: '/manager/settings', label: 'Баптаулар', Icon: Settings },
]

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="MANAGER">
      <div className="min-h-screen bg-slate-50">
        <DashSidebar items={ITEMS} roleLabel="Менеджер" />
        <div className="pt-14 lg:pt-0 lg:pl-64">
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </RequireAuth>
  )
}
