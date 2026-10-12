'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { patchMe, changePassword, getNotifications, NotificationItem } from '@/lib/api';
import { User, Bell, Shield, Check, Loader2 } from 'lucide-react';

export default function StudentSettingsPage() {
  const { user, refresh } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);

  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwErr, setPwErr] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    getNotifications().then(setNotifs).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await patchMe({ full_name: fullName, phone });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    setPwErr('');
    if (newPw.length < 8) return setPwErr('Жаңа құпия сөз кемінде 8 таңба болуы керек');
    if (newPw !== confirmPw) return setPwErr('Жаңа құпия сөздер сәйкес келмейді');
    setPwSaving(true);
    setPwSaved(false);
    try {
      await changePassword({ current_password: currentPw, new_password: newPw });
      setPwSaved(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setTimeout(() => {
        setPwSaved(false);
        setPwOpen(false);
      }, 1800);
    } catch (e: unknown) {
      setPwErr((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Қате шықты');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Баптаулар</h1>
        <p className="mt-1 text-sm text-slate-500">Профиль, хабарламалар және қауіпсіздік.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-900">
          <User className="h-4 w-4 text-zerdeli-600" /> Профиль
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-600">Аты-жөні</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-zerdeli-500 focus:outline-none"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-600">Электронды пошта</span>
            <input
              disabled
              value={user?.email || ''}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-slate-400"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold text-slate-600">Телефон</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 700 000 00 00"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 focus:border-zerdeli-500 focus:outline-none"
            />
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="mt-5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          {saved ? 'Сақталды' : 'Сақтау'}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Bell className="h-4 w-4 text-zerdeli-600" /> Соңғы хабарламалар
        </div>
        {notifs.length === 0 && <div className="text-xs text-slate-400">Хабарлама жоқ</div>}
        <div className="space-y-2">
          {notifs.slice(0, 6).map((n) => (
            <div key={n.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-900">{n.title}</div>
              <div className="text-xs text-slate-500">{n.message}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
          <Shield className="h-4 w-4 text-zerdeli-600" /> Қауіпсіздік
        </div>
        {!pwOpen ? (
          <button
            onClick={() => setPwOpen(true)}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-zerdeli-300"
          >
            Құпия сөзді өзгерту
          </button>
        ) : (
          <div className="space-y-3">
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Қазіргі құпия сөз"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-zerdeli-500 focus:outline-none"
            />
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Жаңа құпия сөз (кемінде 8 таңба)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-zerdeli-500 focus:outline-none"
            />
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              placeholder="Жаңа құпия сөзді қайталаңыз"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-zerdeli-500 focus:outline-none"
            />
            {pwErr && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{pwErr}</div>}
            <div className="flex gap-2">
              <button
                onClick={savePassword}
                disabled={pwSaving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-70"
              >
                {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : pwSaved ? <Check className="h-4 w-4" /> : null}
                {pwSaved ? 'Сақталды' : 'Сақтау'}
              </button>
              <button
                onClick={() => {
                  setPwOpen(false);
                  setPwErr('');
                  setCurrentPw('');
                  setNewPw('');
                  setConfirmPw('');
                }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300"
              >
                Бас тарту
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
