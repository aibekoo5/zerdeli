'use client'

import React from 'react'
import { DashSidebar } from '@/components/DashSidebar'
import { RequireAuth } from '@/components/RequireAuth'
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  FileBarChart,
} from 'lucide-react'

const ITEMS = [
  { href: '/curator', label: 'Басты бет', Icon: LayoutDashboard, exact: true },
  { href: '/curator/students', label: 'Менің оқушыларым', Icon: Users },
  { href: '/curator/attention', label: 'Назар аудару', Icon: AlertTriangle },
  { href: '/curator/reports', label: 'Есептер', Icon: FileBarChart },
]

export default function CuratorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth role="CURATOR">
      <div className="min-h-screen bg-slate-50">
        <DashSidebar items={ITEMS} roleLabel="Куратор" />
        <div className="pt-14 lg:pt-0 lg:pl-64">
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </RequireAuth>
  )
}
