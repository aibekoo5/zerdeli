'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2, Download, FileText, ChevronLeft, Lock, Loader2, ArrowRight,
  Video, BookOpen, Paperclip, PencilLine, ClipboardList, Trophy,
} from 'lucide-react';
import { useApi } from '@/lib/useApi';
import { getCourse, getMyCourses, updateLessonProgress, Course } from '@/lib/api';

type Tab = 'video' | 'theory' | 'materials' | 'practice' | 'homework';

const TABS: { id: Tab; label: string; Icon: typeof Video }[] = [
  { id: 'video', label: 'Видеосабақ', Icon: Video },
  { id: 'theory', label: 'Теория', Icon: BookOpen },
  { id: 'materials', label: 'Материалдар', Icon: Paperclip },
  { id: 'practice', label: 'Практика', Icon: PencilLine },
  { id: 'homework', label: 'Үй жұмысы', Icon: ClipboardList },
];

/** minimal markdown → JSX: ## headings, - bullets, **bold**, paragraphs */
function MD({ text }: { text: string }) {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (k: number) => {
    if (list.length) {
      out.push(
        <ul key={`u${k}`} className="my-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          {list.map((li, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: bold(li) }} />
          ))}
        </ul>,
      );
      list = [];
    }
  };
  const bold = (s: string) => s.replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900">$1</strong>');
  lines.forEach((raw, i) => {
    const l = raw.trim();
    if (l.startsWith('## ')) {
      flush(i);
      out.push(<h3 key={i} className="mb-1 mt-3 text-base font-bold text-slate-900">{l.slice(3)}</h3>);
    } else if (l.startsWith('- ')) {
      list.push(l.slice(2));
    } else if (l) {
      flush(i);
      out.push(<p key={i} className="my-2 text-sm leading-relaxed text-slate-600" dangerouslySetInnerHTML={{ __html: bold(l) }} />);
    }
  });
  flush(lines.length);
  return <div>{out}</div>;
}

function TestNode({ t, kind }: { t: NonNullable<Course['modules']>[number]['section_test']; kind: string }) {
  if (!t) return null;
  const label = kind === 'section' ? 'Бөлім тесті' : kind === 'practice' ? 'Практика тесті' : 'Үй жұмысы тесті';
  return t.is_locked ? (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-400">
      <span className="flex items-center gap-2">
        <Lock className="h-3.5 w-3.5" /> {t.title}
      </span>
    </div>
  ) : (
    <Link
      href={`/student/test/${t.id}`}
      className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100"
    >
      <span className="flex items-center gap-2">
        {kind === 'section' ? <Trophy className="h-3.5 w-3.5" /> : <ClipboardList className="h-3.5 w-3.5" />}
        {label} · {t.total_questions} сұрақ
      </span>
      <span>{t.passed ? '✓' : t.best_percentage != null ? `${Math.round(t.best_percentage)}%` : '→'}</span>
    </Link>
  );
}

export default function LearningPlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50">
          <Loader2 className="h-6 w-6 animate-spin text-zerdeli-500" />
        </div>
      }
    >
      <PlayerInner />
    </Suspense>
  );
}

function PlayerInner() {
  const sp = useSearchParams();
  const courseParam = sp.get('course');
  const lessonParam = sp.get('lesson');

  const myCourses = useApi(getMyCourses, []);
  const resolvedCourseId = courseParam || myCourses.data?.[0]?.id || '';
  const course = useApi<Course | null>(
    () => (resolvedCourseId ? getCourse(resolvedCourseId) : Promise.resolve(null)),
    [resolvedCourseId],
  );

  const modules = useMemo(
    () =>
      (course.data?.modules || [])
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((m) => ({ ...m, lessons: m.lessons.slice().sort((a, b) => a.order_index - b.order_index) })),
    [course.data],
  );
  const lessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules]);

  const [activeId, setActiveId] = useState('');
  const [tab, setTab] = useState<Tab>('video');
  const [done, setDone] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!lessons.length) return;
    setDone(new Set(lessons.filter((l) => l.is_completed).map((l) => l.id)));
    setActiveId((prev) => prev || (lessonParam && lessons.some((l) => l.id === lessonParam) ? lessonParam : lessons[0].id));
  }, [lessons, lessonParam]);

  const current = lessons.find((l) => l.id === activeId) || lessons[0];

  const markComplete = async () => {
    if (!current || done.has(current.id)) return;
    setSaving(true);
    try {
      await updateLessonProgress(current.id, true, 0);
      setDone((s) => new Set(s).add(current.id));
      const i = lessons.findIndex((l) => l.id === current.id);
      if (i >= 0 && i < lessons.length - 1) {
        setActiveId(lessons[i + 1].id);
        setTab('video');
      }
    } finally {
      setSaving(false);
    }
  };

  if (course.loading || myCourses.loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50">
        <Loader2 className="h-6 w-6 animate-spin text-zerdeli-500" />
      </div>
    );
  }

  if (course.error || !course.data) {
    const locked = /құлып|403/i.test(course.error || '');
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Lock className="h-7 w-7" />
        </span>
        <div className="text-lg font-black text-slate-900">{locked ? 'Курс құлыпталған' : 'Курс табылмады'}</div>
        <p className="max-w-sm text-sm text-slate-500">
          {locked ? 'Сабақтарды ашу үшін курсты немесе ҰБТ пакетін сатып алыңыз.' : course.error}
        </p>
        <div className="flex gap-3">
          <Link href="/student/courses" className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600">
            Курстарым
          </Link>
          <Link href="/student/catalog" className="rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-4 py-2.5 text-xs font-bold text-white">
            Каталог
          </Link>
        </div>
      </div>
    );
  }

  const c = course.data;
  const progressPct = lessons.length ? Math.round((lessons.filter((l) => done.has(l.id)).length / lessons.length) * 100) : 0;

  const availableTabs = TABS.filter((t) => {
    if (!current) return false;
    if (t.id === 'video') return true;
    if (t.id === 'theory') return !!current.theory;
    if (t.id === 'materials') return (current.materials?.length || 0) > 0;
    if (t.id === 'practice') return !!current.practice || !!current.practice_test;
    if (t.id === 'homework') return !!current.homework || !!current.homework_test;
    return false;
  });
  const shownTab = availableTabs.some((t) => t.id === tab) ? tab : 'video';

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-50 text-slate-800">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/student/courses" className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-600 hover:text-slate-900">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-slate-900">{c.title}</h1>
            <span className="text-xs font-semibold text-zerdeli-700">{current?.title}</span>
          </div>
        </div>
        <button
          onClick={markComplete}
          disabled={!current || done.has(current?.id || '') || saving}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            current && done.has(current.id)
              ? 'border border-emerald-300 bg-emerald-50 text-emerald-600'
              : 'bg-zerdeli-600 text-white shadow-lg hover:bg-zerdeli-500'
          }`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          <span className="hidden sm:inline">{current && done.has(current.id) ? 'Аяқталды' : 'Сабақты аяқтадым'}</span>
        </button>
      </header>

      <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-12">
        <aside className="space-y-4 overflow-y-auto border-r border-slate-200 bg-slate-100/60 p-4 lg:col-span-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-500">
            <span>Курс мазмұны</span>
            <span className="text-zerdeli-700">{progressPct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-zerdeli-400 to-zerdeli-600" style={{ width: `${progressPct}%` }} />
          </div>

          {modules.map((m, mi) => (
            <div key={m.id} className="space-y-1.5">
              <div className="px-2 text-xs font-bold text-slate-600">
                {String(mi + 1).padStart(2, '0')}-бөлім · {m.title}
              </div>
              {m.lessons.map((l, li) => {
                const isActive = l.id === activeId;
                const isDone = done.has(l.id);
                const locked = !l.video_url && !l.is_free_preview && !c.is_accessible;
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      if (locked) return;
                      setActiveId(l.id);
                      setTab('video');
                    }}
                    disabled={locked}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl border p-3 text-left text-xs transition-all ${
                      isActive
                        ? 'border-zerdeli-500 bg-white font-bold text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    } ${locked ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          isDone ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                        {locked && !isDone && <Lock className="h-2.5 w-2.5" />}
                      </span>
                      <span className="line-clamp-1">{li + 1}-сабақ · {l.title.replace(/^\d+\.\d+\s*/, '')}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{l.duration_minutes}м</span>
                  </button>
                );
              })}
              {m.section_test && <TestNode t={m.section_test} kind="section" />}
            </div>
          ))}
        </aside>

        <main className="space-y-5 overflow-y-auto p-4 sm:p-6 lg:col-span-8">
          {/* lesson tabs */}
          <div className="flex flex-wrap gap-1.5">
            {availableTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                  shownTab === t.id ? 'bg-zerdeli-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-zerdeli-300'
                }`}
              >
                <t.Icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>

          {shownTab === 'video' && (
            <>
              <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-2xl">
                {current?.video_url ? (
                  <iframe
                    src={current.video_url}
                    title={current.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/60">Бейне қолжетімсіз</div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{current?.title}</h2>
                {current?.description && <p className="mt-2 text-sm text-slate-600">{current.description}</p>}
              </div>
            </>
          )}

          {shownTab === 'theory' && current?.theory && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <MD text={current.theory} />
            </div>
          )}

          {shownTab === 'materials' && (
            <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-bold text-slate-900">Жүктелетін материалдар</div>
              {current?.materials?.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-zerdeli-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{m.title}</div>
                      <div className="text-[11px] text-slate-500">{m.file_type}</div>
                    </div>
                  </div>
                  <a href={m.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-xl bg-zerdeli-600 px-3 py-2 text-xs font-semibold text-white">
                    <Download className="h-4 w-4" /> Жүктеу
                  </a>
                </div>
              ))}
            </div>
          )}

          {shownTab === 'practice' && (
            <div className="space-y-4">
              {current?.practice && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <MD text={current.practice} />
                </div>
              )}
              {current?.practice_test && <TestNode t={current.practice_test} kind="practice" />}
            </div>
          )}

          {shownTab === 'homework' && (
            <div className="space-y-4">
              {current?.homework && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                  <MD text={current.homework} />
                </div>
              )}
              {current?.homework_test && <TestNode t={current.homework_test} kind="homework" />}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={() => {
                const i = lessons.findIndex((l) => l.id === activeId);
                if (i > 0) {
                  setActiveId(lessons[i - 1].id);
                  setTab('video');
                }
              }}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
            >
              Алдыңғы сабақ
            </button>
            <button
              onClick={() => {
                const i = lessons.findIndex((l) => l.id === activeId);
                if (i < lessons.length - 1) {
                  setActiveId(lessons[i + 1].id);
                  setTab('video');
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-zerdeli-500 to-zerdeli-600 px-4 py-2.5 text-xs font-bold text-white"
            >
              Келесі сабақ <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
