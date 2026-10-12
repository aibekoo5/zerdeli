from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.access import test_accessible
from app.core.database import get_db
from app.core.deps import get_current_active_student, get_optional_user
from app.models.models import (
    Course, Enrollment, LessonProgress, Test, TestAttempt, User,
)
from app.schemas.schemas import CourseResponse, LessonProgressResponse, SectionTestRef
from app.services.access_service import build_access_context
from app.services.course_service import CourseService

router = APIRouter(prefix="/courses", tags=["Courses"])


async def _student_ctx(db: AsyncSession, user: Optional[User]):
    ctx = await build_access_context(db, user)
    done_ids: set = set()
    attempts_by_test: dict = {}
    if user:
        p_res = await db.execute(
            select(LessonProgress.lesson_id).where(
                LessonProgress.student_id == user.id,
                LessonProgress.is_completed == True,  # noqa: E712
            )
        )
        done_ids = {r[0] for r in p_res.all()}
        a_res = await db.execute(select(TestAttempt).where(TestAttempt.student_id == user.id))
        for a in a_res.scalars().all():
            attempts_by_test.setdefault(a.test_id, []).append(a)
    return ctx, done_ids, attempts_by_test


def _test_ref(t: Test, ctx, attempts_by_test: dict) -> SectionTestRef:
    atts = attempts_by_test.get(t.id, [])
    best = max((a.percentage for a in atts), default=None)
    return SectionTestRef(
        id=t.id, title=t.title, kind=t.kind, total_questions=len(t.questions),
        passing_score=t.passing_score,
        is_locked=not test_accessible(ctx.user, t, ctx.accessible_course_ids, ctx.subscriptions),
        attempts_count=len(atts), best_percentage=best,
        passed=any(a.passed for a in atts),
    )


async def _decorate(db: AsyncSession, course: Course, ctx, done_lesson_ids: set, attempts_by_test: dict):
    accessible = course.id in ctx.accessible_course_ids
    enrolled = course.id in ctx.enrolled_course_ids
    lessons = [l for m in course.modules for l in m.lessons]
    total = len(lessons)
    done = sum(1 for l in lessons if l.id in done_lesson_ids)
    if not accessible:
        for l in lessons:
            if not l.is_free_preview:
                l.video_url = None

    # tests attached to this course (section + per-lesson practice/homework)
    tests = (await db.execute(
        select(Test)
        .where(Test.is_published == True, Test.course_id == course.id)  # noqa: E712
        .options(selectinload(Test.questions))
    )).scalars().all()
    by_module = {t.module_id: t for t in tests if t.module_id}
    by_lesson_practice = {t.lesson_id: t for t in tests if t.lesson_id and t.kind == "practice"}
    by_lesson_homework = {t.lesson_id: t for t in tests if t.lesson_id and t.kind == "homework"}

    data = CourseResponse.model_validate(course)
    data.is_accessible = accessible
    data.is_enrolled = enrolled
    data.total_lessons = total
    data.completed_lessons = done
    data.progress_pct = round(done / total * 100, 1) if total else 0.0

    # align modules/lessons by id (model_validate preserves order but be safe)
    m_map = {m.id: m for m in data.modules}
    l_map = {l.id: l for m in data.modules for l in m.lessons}
    for m in course.modules:
        md = m_map.get(m.id)
        if md and m.id in by_module:
            md.section_test = _test_ref(by_module[m.id], ctx, attempts_by_test)
        for l in m.lessons:
            ld = l_map.get(l.id)
            if not ld:
                continue
            ld.is_completed = l.id in done_lesson_ids
            if l.id in by_lesson_practice:
                ld.practice_test = _test_ref(by_lesson_practice[l.id], ctx, attempts_by_test)
            if l.id in by_lesson_homework:
                ld.homework_test = _test_ref(by_lesson_homework[l.id], ctx, attempts_by_test)
    return data


@router.get("", response_model=List[CourseResponse])
async def list_courses(
    direction: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    courses = await CourseService.get_courses(db, direction=direction, subject=subject, search=search)
    ctx, done_ids, atts = await _student_ctx(db, user)
    return [await _decorate(db, c, ctx, done_ids, atts) for c in courses]


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course_detail(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    course = await CourseService.get_course_by_id(db, course_id)
    ctx, done_ids, atts = await _student_ctx(db, user)
    return await _decorate(db, course, ctx, done_ids, atts)


@router.post("/{course_id}/enroll", status_code=status.HTTP_200_OK)
async def enroll_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    course = (await db.execute(select(Course).where(Course.id == course_id))).scalars().first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Курс табылмады")
    if (course.discount_price or course.price or 0) > 0:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Бұл курс ақылы — сатып алу қажет.",
        )
    await CourseService.enroll_student(db, current_user.id, course_id)
    return {"message": "Курсқа сәтті жазылдыңыз"}


@router.post("/lessons/{lesson_id}/progress", response_model=LessonProgressResponse)
async def update_lesson_progress(
    lesson_id: str,
    is_completed: bool = Query(True),
    last_watched_second: int = Query(0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    return await CourseService.update_lesson_progress(
        db, current_user.id, lesson_id, is_completed, last_watched_second
    )
