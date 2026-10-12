'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { adminCreateCourse, adminTeachers } from '@/lib/api';

const DIRS = ['UNT', 'NIS', 'BIL', 'RFMSH'];

export function CourseModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [direction, setDirection] = useState('UNT');
  const [subject, setSubject] = useState('');
  const [price, setPrice] = useState(24900);
  const [discount, setDiscount] = useState<number | ''>('');
  const [teacherId, setTeacherId] = useState('');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    adminTeachers().then((t) => {
      setTeachers(t);
      if (t[0]) setTeacherId(t[0].id);
    });
  }, []);

  const field = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-zerdeli-500 focus:outline-none';

  const save = async () => {
    setErr('');
    if (title.trim().length < 3 || desc.trim().length < 3 || !subject.trim() || !teacherId)
      return setErr('Барлық өрісті толтырыңыз');
    setBusy(true);
    try {
      await adminCreateCourse({
        title: title.trim(),
        description: desc.trim(),
        direction,
        subject: subject.trim(),
        price,
        discount_price: discount === '' ? null : discount,
        teacher_id: teacherId,
      });
      onDone();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Қате');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative my-6 w-full max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-black text-slate-900">Жаңа курс</h3>

        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Курс атауы" className={field} />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Сипаттама" className={`${field} resize-none`} />
        <div className="grid grid-cols-2 gap-3">
          <select value={direction} onChange={(e) => setDirection(e.target.value)} className={field}>
            {DIRS.map((d) => (
              <option key={d} value={d}>{d === 'UNT' ? 'ҰБТ' : d}</option>
            ))}
          </select>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Пән" className={field} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-500">
            Баға ₸
            <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className={field} />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Жеңілдік ₸
            <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value === '' ? '' : +e.target.value)} className={field} />
          </label>
        </div>
        <label className="block text-xs font-semibold text-slate-500">
          Мұғалім
          <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={field}>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
        </label>

        {err && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{err}</div>}
        <button onClick={save} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-3 text-sm font-bold text-white disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Жариялау'}
        </button>
      </motion.div>
    </div>
  );
}
