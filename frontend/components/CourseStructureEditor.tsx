'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft, Plus, Video, BookOpen, ClipboardList, Trophy, Loader2, FolderPlus,
} from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { teacherCourseStructure, teacherCreateModule } from '@/lib/api';
import { LoadingBlock, ErrorBlock } from '@/components/ui/States';
import { LessonBuilder } from '@/components/teacher/LessonBuilder';
import { TestBuilder } from '@/components/teacher/TestBuilder';

export function CourseStructureEditor({ backHref }: { backHref: string }) {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const { data, loading, error, reload } = useApi(() => teacherCourseStructure(id), [id]);

  const [newModule, setNewModule] = useState('');
  const [addingModule, setAddingModule] = useState(false);
  const [lessonFor, setLessonFor] = useState<{ id: string; title: string } | null>(null);
  const [testFor, setTestFor] = useState<{ moduleId?: string; title?: string } | null>(null);

  if (loading) return <LoadingBlock />;
  if (error || !data) return <ErrorBlock message={error} onRetry={reload} />;

  const addModule = async () => {
    if (newModule.trim().length < 2) return;
    setAddingModule(true);
    try {
      await teacherCreateModule(id, newModule.trim());
      setNewModule('');
      reload();
    } finally {
      setAddingModule(false);
    }
  };

  const modules = (data.modules || []).slice().sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-6">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-zerdeli-700">
        <ChevronLeft className="h-4 w-4" /> Курстар
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{data.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {modules.length} бөлім · {modules.reduce((s, m) => s + m.lessons.length, 0)} сабақ
          </p>
        </div>
        <button
          onClick={() => setTestFor({})}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-zerdeli-300"
        >
          <Plus className="h-4 w-4" /> Курс тесті
        </button>
      </div>

      <div className="space-y-4">
        {modules.map((m, mi) => (
          <div key={m.id} className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div className="font-bold text-slate-900">
                {String(mi + 1).padStart(2, '0')}-бөлім · {m.title}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLessonFor({ id: m.id, title: `${mi + 1}-бөлім: ${m.title}` })}
                  className="flex items-center gap-1 rounded-lg bg-zerdeli-50 px-2.5 py-1.5 text-xs font-bold text-zerdeli-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Сабақ
                </button>
                <button
                  onClick={() => setTestFor({ moduleId: m.id, title: `${mi + 1}-бөлім: ${m.title}` })}
                  className="flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Тест
                </button>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {m.lessons
                .slice()
                .sort((a, b) => a.order_index - b.order_index)
                .map((l, li) => (
                  <div key={l.id} className="flex items-center justify-between p-3.5 text-sm">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="text-xs font-bold text-slate-400">{li + 1}.</span>
                      {l.title}
                    </span>
                    <span className="flex items-center gap-2 text-slate-400">
                      {l.video_url && <Video className="h-3.5 w-3.5" />}
                      {l.theory && <BookOpen className="h-3.5 w-3.5" />}
                      {l.homework_test && <ClipboardList className="h-3.5 w-3.5 text-amber-500" />}
                      <span className="text-[11px]">{l.duration_minutes}м</span>
                    </span>
                  </div>
                ))}
              {m.lessons.length === 0 && <div className="p-4 text-center text-xs text-slate-400">Сабақ жоқ</div>}
              {m.section_test && (
                <div className="flex items-center gap-2 bg-amber-50/40 p-3.5 text-xs font-bold text-amber-700">
                  <Trophy className="h-3.5 w-3.5" /> {m.section_test.title} · {m.section_test.total_questions} сұрақ
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-2 rounded-2xl border border-dashed border-slate-300 bg-white p-3">
          <input
            value={newModule}
            onChange={(e) => setNewModule(e.target.value)}
            placeholder="Жаңа бөлім атауы..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-zerdeli-500 focus:outline-none"
          />
          <button
            onClick={addModule}
            disabled={addingModule}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {addingModule ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
            Бөлім қосу
          </button>
        </div>
      </div>

      {lessonFor && (
        <LessonBuilder
          moduleId={lessonFor.id}
          moduleTitle={lessonFor.title}
          onClose={() => setLessonFor(null)}
          onDone={() => {
            setLessonFor(null);
            reload();
          }}
        />
      )}
      {testFor && (
        <TestBuilder
          courseId={id}
          moduleId={testFor.moduleId}
          moduleTitle={testFor.title}
          onClose={() => setTestFor(null)}
          onDone={() => {
            setTestFor(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
