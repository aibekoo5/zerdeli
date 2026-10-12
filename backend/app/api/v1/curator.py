from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_curator
from app.models.models import (
    Course, CourseModule, Enrollment, Lesson, LessonProgress, Notification,
    Subscription, Test, TestAttempt, User,
)
from app.schemas.schemas import (
    AttemptSummary, CuratorDashboard, CuratorMessage, CuratorStudentDetail,
    CuratorStudentItem, DashboardCourse, DashboardDeadline,
)

router = APIRouter(prefix="/curator", tags=["Curator"])


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is not None and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


async def _my_students(db: AsyncSession, curator: User) -> List[User]:
    q = select(User).where(User.role == "STUDENT")
    if curator.role != "ADMIN":
        q = q.where(User.curator_id == curator.id)
    return list((await db.execute(q)).scalars().all())


async def _homework_tests(db: AsyncSession) -> List[Test]:
    res = await db.execute(
        select(Test).where(
            Test.is_published == True,  # noqa: E712
            Test.kind.in_(["homework", "section"]),
            Test.course_id.isnot(None),
        )
    )
    return list(res.scalars().all())


async def _build_item(db: AsyncSession, u: User, hw_tests: List[Test]) -> CuratorStudentItem:
    # progress
    total_lessons = (await db.execute(select(func.count(Lesson.id)))).scalar() or 30
    prog_rows = (await db.execute(
        select(LessonProgress).where(
            LessonProgress.student_id == u.id, LessonProgress.is_completed == True,  # noqa: E712
        )
    )).scalars().all()
    lessons_done = len(prog_rows)
    last_lesson_at = max((_aware(p.updated_at) for p in prog_rows), default=None)

    attempts = (await db.execute(
        select(TestAttempt).where(TestAttempt.student_id == u.id)
    )).scalars().all()
    avg = round(sum(a.percentage for a in attempts) / len(attempts), 1) if attempts else None
    passed_ids = {a.test_id for a in attempts if a.passed}

    # accessible courses (enrolled or active sub)
    enr = {e.course_id for e in (await db.execute(
        select(Enrollment).where(Enrollment.student_id == u.id)
    )).scalars().all()}
    now = datetime.now(timezone.utc)
    has_sub = any(
        s.is_active and (_aware(s.end_date) is None or _aware(s.end_date) >= now)
        for s in (await db.execute(select(Subscription).where(Subscription.student_id == u.id))).scalars().all()
    )
    unfinished = 0
    for t in hw_tests:
        if t.id in passed_ids:
            continue
        if t.course_id in enr:
            unfinished += 1

    login = _aware(u.last_login_at)
    days_since_login = (now - login).days if login else 999
    days_since_lesson = (now - last_lesson_at).days if last_lesson_at else 999

    if days_since_login >= 5 or days_since_lesson >= 7:
        st = "inactive"
    elif unfinished >= 2 or (avg is not None and avg < 60) or days_since_lesson >= 3:
        st = "attention"
    else:
        st = "ok"

    return CuratorStudentItem(
        id=u.id, full_name=u.full_name, email=u.email, phone=u.phone,
        direction=u.preparation_direction or "NIS",
        progress_pct=round(min(lessons_done, total_lessons) / max(total_lessons, 1) * 100, 1),
        lessons_done=lessons_done, last_login_at=login, last_lesson_at=last_lesson_at,
        unfinished_homework=unfinished, avg_score=avg, status=st,
    )


@router.get("/dashboard", response_model=CuratorDashboard)
async def curator_dashboard(
    db: AsyncSession = Depends(get_db),
    curator: User = Depends(get_current_curator),
):
    students = await _my_students(db, curator)
    hw = await _homework_tests(db)
    items = [await _build_item(db, u, hw) for u in students]
    now = datetime.now(timezone.utc)
    active_today = sum(
        1 for i in items if i.last_login_at and (now - i.last_login_at).days < 1
    )
    return CuratorDashboard(
        total_students=len(items),
        active_today=active_today,
        needs_attention=sum(1 for i in items if i.status == "attention"),
        inactive=sum(1 for i in items if i.status == "inactive"),
        students=sorted(items, key=lambda x: ({"inactive": 0, "attention": 1, "ok": 2}[x.status], x.full_name)),
    )


@router.get("/students", response_model=List[CuratorStudentItem])
async def curator_students(
    db: AsyncSession = Depends(get_db),
    curator: User = Depends(get_current_curator),
):
    students = await _my_students(db, curator)
    hw = await _homework_tests(db)
    items = [await _build_item(db, u, hw) for u in students]
    return sorted(items, key=lambda x: x.full_name)


@router.get("/students/{student_id}", response_model=CuratorStudentDetail)
async def curator_student_detail(
    student_id: str,
    db: AsyncSession = Depends(get_db),
    curator: User = Depends(get_current_curator),
):
    u = (await db.execute(select(User).where(User.id == student_id))).scalars().first()
    if not u or u.role != "STUDENT":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Оқушы табылмады")
    if curator.role != "ADMIN" and u.curator_id != curator.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Бұл оқушы сізге бекітілмеген")

    hw = await _homework_tests(db)
    item = await _build_item(db, u, hw)

    # courses with progress
    enr = {e.course_id for e in (await db.execute(
        select(Enrollment).where(Enrollment.student_id == u.id)
    )).scalars().all()}
    courses = (await db.execute(
        select(Course).where(Course.id.in_(enr))
        .options(selectinload(Course.modules).selectinload(CourseModule.lessons))
    )).scalars().all() if enr else []
    done_ids = {p.lesson_id for p in (await db.execute(
        select(LessonProgress).where(
            LessonProgress.student_id == u.id, LessonProgress.is_completed == True,  # noqa: E712
        )
    )).scalars().all()}
    dcourses = []
    for c in courses:
        lessons = [l for m in c.modules for l in m.lessons]
        d = sum(1 for l in lessons if l.id in done_ids)
        nxt = next((l.id for m in sorted(c.modules, key=lambda x: x.order_index)
                    for l in sorted(m.lessons, key=lambda x: x.order_index) if l.id not in done_ids), None)
        dcourses.append(DashboardCourse(
            id=c.id, title=c.title, direction=c.direction,
            progress_pct=round(d / len(lessons) * 100, 1) if lessons else 0.0,
            completed_lessons=d, total_lessons=len(lessons), next_lesson_id=nxt,
        ))

    atts = (await db.execute(
        select(TestAttempt).where(TestAttempt.student_id == u.id).order_by(TestAttempt.started_at.desc())
    )).scalars().all()
    titles = {}
    if atts:
        titles = {r[0]: r[1] for r in (await db.execute(
            select(Test.id, Test.title).where(Test.id.in_({a.test_id for a in atts}))
        )).all()}
    attempts = [
        AttemptSummary(
            id=a.id, test_id=a.test_id, test_title=titles.get(a.test_id, "Тест"),
            score=a.score, max_score=a.max_score, percentage=a.percentage,
            passed=a.passed, completed_at=a.completed_at,
        )
        for a in atts[:8]
    ]
    passed_ids = {a.test_id for a in atts if a.passed}
    upcoming = []
    for t in hw:
        if t.id in passed_ids:
            continue
        if t.course_id in enr:
            upcoming.append(DashboardDeadline(
                id=t.id, title=t.title, kind=t.kind, course_title=None, due_at=t.due_at,
            ))
    upcoming = upcoming[:6]

    from app.models.models import TestAnswer  # local import to avoid cycle noise
    wrong = 0
    if atts:
        wrong = (await db.execute(
            select(func.count(TestAnswer.id))
            .where(TestAnswer.attempt_id.in_([a.id for a in atts]), TestAnswer.is_correct == False)  # noqa: E712
        )).scalar() or 0
    sent = (await db.execute(
        select(func.count(Notification.id)).where(
            Notification.user_id == u.id, Notification.type == "curator"
        )
    )).scalar() or 0

    return CuratorStudentDetail(
        student=item, courses=dcourses, attempts=attempts, upcoming=upcoming,
        total_mistakes=wrong, notifications_sent=sent,
    )


@router.post("/students/{student_id}/message")
async def curator_send_message(
    student_id: str,
    body: CuratorMessage,
    db: AsyncSession = Depends(get_db),
    curator: User = Depends(get_current_curator),
):
    u = (await db.execute(select(User).where(User.id == student_id))).scalars().first()
    if not u or u.role != "STUDENT":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Оқушы табылмады")
    if curator.role != "ADMIN" and u.curator_id != curator.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Бұл оқушы сізге бекітілмеген")
    db.add(Notification(
        user_id=u.id, title=body.title, message=body.message, type="curator", is_read=False,
    ))
    await db.commit()
    return {"ok": True}
