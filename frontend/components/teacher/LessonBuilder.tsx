'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, Plus, Trash2 } from 'lucide-react';
import { teacherCreateLesson } from '@/lib/api';

export function LessonBuilder({
  moduleId,
  moduleTitle,
  onClose,
  onDone,
}: {
  moduleId: string;
  moduleTitle: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [video, setVideo] = useState('');
  const [theory, setTheory] = useState('');
  const [practice, setPractice] = useState('');
  const [homework, setHomework] = useState('');
  const [duration, setDuration] = useState(15);
  const [materials, setMaterials] = useState<{ title: string; file_url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const save = async () => {
    if (title.trim().length < 2) {
      setErr('Атауын енгізіңіз');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      await teacherCreateLesson({
        module_id: moduleId,
        title: title.trim(),
        description: description || null,
        video_url: video || null,
        theory: theory || null,
        practice: practice || null,
        homework: homework || null,
        duration_minutes: duration,
        materials: materials.filter((m) => m.title.trim()).map((m) => ({ title: m.title, file_url: m.file_url || '/materials/file.pdf', file_type: 'PDF' })),
      });
      onDone();
    } catch (e: unknown) {
      setErr((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Қате');
      setBusy(false);
    }
  };

  const field = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-zerdeli-500 focus:outline-none';

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative my-6 w-full max-w-lg space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
        <div>
          <h3 className="text-lg font-black text-slate-900">Жаңа сабақ</h3>
          <p className="text-xs text-slate-500">{moduleTitle}</p>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">Атауы *</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} placeholder="1.1 Арифметикалық орта..." />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">Қысқа сипаттама</span>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
        </label>
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-600">🎥 Видео (embed URL)</span>
            <input value={video} onChange={(e) => setVideo(e.target.value)} className={field} placeholder="https://youtube.com/embed/..." />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-slate-600">Мин</span>
            <input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} className={`${field} w-20`} />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">📄 Теория (markdown)</span>
          <textarea value={theory} onChange={(e) => setTheory(e.target.value)} rows={3} className={`${field} resize-none`} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">✏️ Практика тапсырмасы</span>
          <textarea value={practice} onChange={(e) => setPractice(e.target.value)} rows={2} className={`${field} resize-none`} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold text-slate-600">📝 Үй жұмысы</span>
          <textarea value={homework} onChange={(e) => setHomework(e.target.value)} rows={2} className={`${field} resize-none`} />
        </label>

        <div className="text-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold text-slate-600">📎 Материалдар</span>
            <button
              onClick={() => setMaterials((m) => [...m, { title: '', file_url: '' }])}
              className="flex items-center gap-1 text-xs font-bold text-zerdeli-700"
            >
              <Plus className="h-3.5 w-3.5" /> Қосу
            </button>
          </div>
          {materials.map((m, i) => (
            <div key={i} className="mb-2 flex gap-2">
              <input
                value={m.title}
                onChange={(e) => setMaterials((arr) => arr.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
                placeholder="Файл атауы"
                className={field}
              />
              <button onClick={() => setMaterials((arr) => arr.filter((_, j) => j !== i))} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {err && <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{err}</div>}
        <button
          onClick={save}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Жариялау'}
        </button>
      </motion.div>
    </div>
  );
}
