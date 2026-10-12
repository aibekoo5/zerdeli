'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type Role = 'STUDENT' | 'TEACHER' | 'CURATOR' | 'MANAGER' | 'ADMIN';

const HOME: Record<Role, string> = {
  STUDENT: '/student',
  TEACHER: '/teacher',
  CURATOR: '/curator',
  MANAGER: '/manager',
  ADMIN: '/admin',
};

/**
 * Client-side guard for cabinet routes. The demo auth token lives in
 * localStorage (not a cookie), so protection has to run on the client.
 * - not logged in  -> redirect to the landing page (/)
 * - wrong role      -> redirect to that user's own cabinet (ADMIN may enter any)
 */
export function RequireAuth({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const roleOk = !!user && (!role || user.role === role || user.role === 'ADMIN');

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/');
    } else if (!roleOk) {
      router.replace(HOME[user.role as Role] ?? '/');
    }
  }, [isLoading, user, roleOk, router]);

  if (isLoading || !user || !roleOk) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-zerdeli-500" />
        <span className="sr-only">Жүктелуде…</span>
      </div>
    );
  }

  return <>{children}</>;
}
