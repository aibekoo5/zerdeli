'use client';

import React, { useState } from 'react';
import { Building2, Percent, CreditCard, Shield, ChevronRight } from 'lucide-react';

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      onClick={() => set(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-zerdeli-500' : 'bg-slate-300'}`}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export default function AdminSettingsPage() {
  const [moderation, setModeration] = useState(true);
  const [kaspi, setKaspi] = useState(true);
  const [reg, setReg] = useState(true);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Баптаулар</h1>
        <p className="mt-1 text-sm text-slate-500">Платформа параметрлері мен қаржы ережелері.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Building2 className="h-4 w-4 text-zerdeli-600" /> Орталық туралы
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-600">Атауы</span>
            <input defaultValue="Zerdeli Education · Ұзынағаш" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-zerdeli-500 focus:outline-none" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-600">Байланыс телефоны</span>
            <input defaultValue="+7 (701) 234-56-78" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-zerdeli-500 focus:outline-none" />
          </label>
        </div>
        <button className="mt-5 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-5 py-2.5 text-sm font-bold text-white">
          Сақтау
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Percent className="h-4 w-4 text-zerdeli-600" /> Қаржы ережелері
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-600">Платформа комиссиясы (әдепкі)</span>
            <input defaultValue="30%" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-zerdeli-500 focus:outline-none" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-600">Ұстаздарға төлеу күні</span>
            <input defaultValue="Әр айдың 5-і" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-zerdeli-500 focus:outline-none" />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-900">
          <CreditCard className="h-4 w-4 text-zerdeli-600" /> Жүйелік ауыстырғыштар
        </div>
        <div className="space-y-4 text-sm">
          {[
            ['Жаңа курстар модерациядан өтсін', moderation, setModeration],
            ['Kaspi 0-0-12 бөліп төлеу қосулы', kaspi, setKaspi],
            ['Ашық тіркелу (оқушылар)', reg, setReg],
          ].map(([l, on, set], i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-slate-700">{l as string}</span>
              <Toggle on={on as boolean} set={set as (v: boolean) => void} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Shield className="h-4 w-4 text-zerdeli-600" /> Қауіпсіздік
        </div>
        <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-zerdeli-300">
          Әкімшілер журналын қарау
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      </section>
    </div>
  );
}
