import json
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.access import has_active_subscription, test_accessible
from app.core.database import get_db
from app.core.deps import get_current_active_student
from app.models.models import (
    AnswerOption, Course, CourseModule, Enrollment, Lesson, LessonProgress,
    Notification, Payment, Question, Subscription, Test, TestAnswer, TestAttempt,
    User,
)
from app.schemas.schemas import (
    AchievementResponse, AttemptSummary, DashboardAttempt, DashboardCourse,
    DashboardDeadline, EnrolledCourseResponse, LeaderboardUser, MistakeGroup,
    MistakeItem, MistakeOption, MistakesResponse, NotificationResponse,
    PaymentResponse, ProfileUpdate, StudentAnalytics, StudentDashboard,
    SubscriptionResponse, UserResponse,
)
from app.services.access_service import build_access_context
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["Students"])


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is not None and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


async def _active_subscription(db: AsyncSession, student_id: str) -> Optional[Subscription]:
    res = await db.execute(
        select(Subscription).where(Subscription.student_id == student_id).order_by(Subscription.end_date.desc())
    )
    now = datetime.now(timezone.utc)
    for s in res.scalars().all():
        end = _aware(s.end_date)
        if s.is_active and (end is None or end >= now):
            return s
    return None


async def _course_progress(db: AsyncSession, student_id: str, course_ids: List[str]) -> dict:
    """course_id -> (total_lessons, completed_lessons, ordered_lesson_ids)."""
    if not course_ids:
        return {}
    res = await db.execute(
        select(Course)
        .where(Course.id.in_(course_ids))
        .options(selectinload(Course.modules).selectinload(CourseModule.lessons))
    )
    courses = res.scalars().all()

    prog_res = await db.execute(
        select(LessonProgress).where(
            LessonProgress.student_id == student_id,
            LessonProgress.is_completed == True,  # noqa: E712
        )
    )
    done_lesson_ids = {p.lesson_id for p in prog_res.scalars().all()}

    out = {}
    for c in courses:
        lessons = []
        for m in sorted(c.modules, key=lambda x: x.order_index):
            for l in sorted(m.lessons, key=lambda x: x.order_index):
                lessons.append(l.id)
        done = [lid for lid in lessons if lid in done_lesson_ids]
        next_lesson = next((lid for lid in lessons if lid not in done_lesson_ids), None)
        out[c.id] = {
            "total": len(lessons),
            "done": len(done),
            "next": next_lesson,
            "title": c.title,
            "direction": c.direction,
            "subject": c.subject,
            "cover": c.cover_image,
        }
    return out


@router.get("/me/dashboard", response_model=StudentDashboard)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    ctx = await build_access_context(db, current_user)

    # Courses the student is actively working through (enrolled or via subscription).
    working_ids = set(ctx.enrolled_course_ids)
    if has_active_subscription(ctx.subscriptions):
        working_ids |= ctx.accessible_course_ids
    prog = await _course_progress(db, current_user.id, list(working_ids))

    active_courses = []
    for cid, p in prog.items():
        if p["total"] == 0:
            continue
        pct = round(p["done"] / p["total"] * 100, 1)
        active_courses.append(DashboardCourse(
            id=cid, title=p["title"], direction=p["direction"],
            progress_pct=pct, completed_lessons=p["done"], total_lessons=p["total"],
            next_lesson_id=p["next"],
        ))
    active_courses.sort(key=lambda c: (c.progress_pct >= 100, -c.progress_pct))

    # Attempts
    att_res = await db.execute(
        select(TestAttempt).where(TestAttempt.student_id == current_user.id)
        .order_by(TestAttempt.started_at.desc())
    )
    attempts = att_res.scalars().all()
    tests_map = {}
    if attempts:
        t_res = await db.execute(select(Test).where(Test.id.in_({a.test_id for a in attempts})))
        tests_map = {t.id: t for t in t_res.scalars().all()}
    recent_attempts = [
        DashboardAttempt(
            id=a.id,
            test_title=tests_map.get(a.test_id).title if a.test_id in tests_map else "Тест",
            percentage=a.percentage, passed=a.passed, completed_at=a.completed_at,
        )
        for a in attempts[:4]
    ]
    avg_score = round(sum(a.percentage for a in attempts) / len(attempts), 1) if attempts else 0.0

    # Upcoming: published tests for accessible courses (or mock exams if subscribed)
    # that still have no passing attempt.
    passed_test_ids = {a.test_id for a in attempts if a.passed}
    all_tests = (await db.execute(
        select(Test).where(Test.is_published == True)  # noqa: E712
        .options(selectinload(Test.questions))
    )).scalars().all()
    course_titles = {cid: p["title"] for cid, p in prog.items()}
    if not course_titles:
        c_res = await db.execute(select(Course.id, Course.title))
        course_titles = {row[0]: row[1] for row in c_res.all()}

    upcoming = []
    for t in all_tests:
        if t.id in passed_test_ids:
            continue
        locked = not test_accessible(current_user, t, ctx.accessible_course_ids, ctx.subscriptions)
        if locked:
            continue
        upcoming.append(DashboardDeadline(
            id=t.id, title=t.title, kind=t.kind,
            course_title=course_titles.get(t.course_id) if t.course_id else "ҰБТ дайындық",
            due_at=t.due_at, is_locked=False,
        ))
    upcoming.sort(key=lambda d: (d.due_at is None, _aware(d.due_at) or datetime.max.replace(tzinfo=timezone.utc)))
    upcoming = upcoming[:5]

    sub = await _active_subscription(db, current_user.id)
    lb_res = await db.execute(
        select(func.count(LessonProgress.id)).where(
            LessonProgress.student_id == current_user.id,
            LessonProgress.is_completed == True,  # noqa: E712
        )
    )
    lessons_done = lb_res.scalar() or 0

    analytics_lb = await StudentService.get_student_analytics(db, current_user.id)

    return StudentDashboard(
        full_name=current_user.full_name,
        preparation_direction=current_user.preparation_direction or "NIS",
        streak_days=analytics_lb.streak_days,
        total_points=analytics_lb.total_points,
        active_courses=active_courses,
        upcoming=upcoming,
        recent_attempts=recent_attempts,
        subscription=SubscriptionResponse.model_validate(sub) if sub else None,
        courses_count=len(active_courses),
        lessons_done=lessons_done,
        avg_score=avg_score,
    )


@router.get("/me/courses", response_model=List[EnrolledCourseResponse])
async def my_courses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    ctx = await build_access_context(db, current_user)
    ids = set(ctx.enrolled_course_ids)
    if has_active_subscription(ctx.subscriptions):
        ids |= ctx.accessible_course_ids
    prog = await _course_progress(db, current_user.id, list(ids))

    # teacher names
    t_names = {}
    if ids:
        rows = await db.execute(
            select(Course.id, User.full_name).join(User, Course.teacher_id == User.id).where(Course.id.in_(ids))
        )
        t_names = {r[0]: r[1] for r in rows.all()}

    out = []
    for cid, p in prog.items():
        pct = round(p["done"] / p["total"] * 100, 1) if p["total"] else 0.0
        out.append(EnrolledCourseResponse(
            id=cid, title=p["title"], cover_image=p["cover"], direction=p["direction"],
            subject=p["subject"], teacher_name=t_names.get(cid),
            total_lessons=p["total"], completed_lessons=p["done"], progress_pct=pct,
            next_lesson_id=p["next"], is_finished=(p["total"] > 0 and p["done"] >= p["total"]),
            via="enrollment" if cid in ctx.enrolled_course_ids else "subscription",
        ))
    out.sort(key=lambda c: (c.is_finished, -c.progress_pct))
    return out


@router.get("/me/payments", response_model=List[PaymentResponse])
async def my_payments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    res = await db.execute(
        select(Payment).where(Payment.student_id == current_user.id).order_by(Payment.created_at.desc())
    )
    return res.scalars().all()


@router.get("/me/attempts", response_model=List[AttemptSummary])
async def my_attempts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    res = await db.execute(
        select(TestAttempt).where(TestAttempt.student_id == current_user.id)
        .order_by(TestAttempt.started_at.desc())
    )
    attempts = res.scalars().all()
    titles = {}
    if attempts:
        t_res = await db.execute(select(Test.id, Test.title).where(Test.id.in_({a.test_id for a in attempts})))
        titles = {r[0]: r[1] for r in t_res.all()}
    return [
        AttemptSummary(
            id=a.id, test_id=a.test_id, test_title=titles.get(a.test_id, "Тест"),
            score=a.score, max_score=a.max_score, percentage=a.percentage,
            passed=a.passed, completed_at=a.completed_at,
        )
        for a in attempts
    ]


@router.get("/me/subscription", response_model=Optional[SubscriptionResponse])
async def my_subscription(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    sub = await _active_subscription(db, current_user.id)
    return SubscriptionResponse.model_validate(sub) if sub else None


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    body: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    if body.full_name is not None:
        current_user.full_name = body.full_name.strip()
    if body.phone is not None:
        current_user.phone = body.phone.strip() or None
    if body.preparation_direction is not None:
        current_user.preparation_direction = body.preparation_direction
    if body.avatar_url is not None:
        current_user.avatar_url = body.avatar_url or None
    await db.commit()
    await db.refresh(current_user)
    return current_user


# --- unchanged endpoints ---
@router.get("/me/analytics", response_model=StudentAnalytics)
async def get_my_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    return await StudentService.get_student_analytics(db, current_user.id)


@router.get("/leaderboard", response_model=List[LeaderboardUser])
async def get_leaderboard(
    timeframe: str = Query("all", enum=["weekly", "monthly", "all"]),
    db: AsyncSession = Depends(get_db),
):
    return await StudentService.get_leaderboard(db, timeframe)


@router.get("/me/achievements", response_model=List[AchievementResponse])
async def get_my_achievements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    return await StudentService.get_achievements(db, current_user.id)


@router.get("/me/notifications", response_model=List[NotificationResponse])
async def get_my_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    res = await db.execute(
        select(Notification).where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
    )
    return res.scalars().all()


@router.post("/me/notifications/read")
async def mark_notifications_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    res = await db.execute(
        select(Notification).where(
            Notification.user_id == current_user.id, Notification.is_read == False,  # noqa: E712
        )
    )
    for n in res.scalars().all():
        n.is_read = True
    await db.commit()
    return {"ok": True}


@router.get("/me/mistakes", response_model=MistakesResponse)
async def get_my_mistakes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    # all attempts by this student
    att_res = await db.execute(
        select(TestAttempt).where(TestAttempt.student_id == current_user.id)
    )
    attempts = att_res.scalars().all()
    if not attempts:
        return MistakesResponse(total_mistakes=0, repeated=0, groups=[])
    attempt_ids = [a.id for a in attempts]
    attempt_test = {a.id: a.test_id for a in attempts}

    ans_res = await db.execute(
        select(TestAnswer).where(
            TestAnswer.attempt_id.in_(attempt_ids), TestAnswer.is_correct == False,  # noqa: E712
        )
    )
    wrong = ans_res.scalars().all()
    if not wrong:
        return MistakesResponse(total_mistakes=0, repeated=0, groups=[])

    q_ids = {w.question_id for w in wrong}
    questions = {
        q.id: q for q in (await db.execute(
            select(Question).where(Question.id.in_(q_ids)).options(selectinload(Question.options))
        )).scalars().all()
    }
    test_ids = {attempt_test[w.attempt_id] for w in wrong}
    tests = {
        t.id: t for t in (await db.execute(
            select(Test).where(Test.id.in_(test_ids))
        )).scalars().all()
    }
    course_ids = {t.course_id for t in tests.values() if t.course_id}
    course_subjects = {
        r[0]: r[1] for r in (await db.execute(
            select(Course.id, Course.subject).where(Course.id.in_(course_ids))
        )).all()
    }

    # group wrong answers by question, count occurrences
    per_question: dict = {}
    for w in wrong:
        per_question.setdefault(w.question_id, []).append(w)

    groups: dict = {}
    for qid, ws in per_question.items():
        q = questions.get(qid)
        if not q:
            continue
        test = tests.get(attempt_test[ws[0].attempt_id])
        subject = course_subjects.get(test.course_id) if test and test.course_id else (
            test.direction if test else "ҰБТ"
        )
        key = subject
        groups.setdefault(key, {"course_id": test.course_id if test else None, "items": []})

        correct_opts = [o for o in q.options if o.is_correct]
        correct_txt = ", ".join(o.option_text for o in correct_opts) or "—"
        last = ws[-1]
        try:
            sel_ids = json.loads(last.selected_option_ids) if last.selected_option_ids else []
        except (ValueError, TypeError):
            sel_ids = []
        sel_map = {o.id: o.option_text for o in q.options}
        your_txt = ", ".join(sel_map.get(i, "?") for i in sel_ids) or (last.numerical_answer or "жауап жоқ")

        groups[key]["items"].append(MistakeItem(
            question_id=qid,
            question_text=q.question_text,
            question_type=q.question_type,
            test_title=test.title if test else "Тест",
            your_answer=your_txt,
            correct_answer=correct_txt,
            explanation=q.explanation,
            times_wrong=len(ws),
            options=[MistakeOption(id=o.id, text=o.option_text, is_correct=o.is_correct) for o in q.options],
        ))

    out_groups = []
    total = 0
    repeated_total = 0
    for subject, g in groups.items():
        items = sorted(g["items"], key=lambda x: -x.times_wrong)
        rep = sum(1 for i in items if i.times_wrong >= 2)
        total += len(items)
        repeated_total += rep
        out_groups.append(MistakeGroup(
            subject=subject, course_id=g["course_id"], total=len(items),
            repeated=rep, fresh=len(items) - rep, items=items,
        ))
    out_groups.sort(key=lambda x: -x.total)
    return MistakesResponse(total_mistakes=total, repeated=repeated_total, groups=out_groups)
