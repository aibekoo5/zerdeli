from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import get_current_teacher
from app.models.models import (
    AnswerOption, Course, CourseModule, Enrollment, Lesson, LessonMaterial,
    LessonProgress, LiveSession, Payment, Question, Test, TestAttempt, User,
)
from app.schemas.schemas import (
    CourseCreate, CourseResponse, GradesJournal, LiveSessionItem, ModuleCreate,
    TeacherCourseItem, TeacherHomeworkItem, TeacherLessonCreate,
    TeacherLessonUpdate, TeacherStudentItem, TeacherTestCreate,
)


async def _own_course(db: AsyncSession, teacher: User, course_id: str) -> Course:
    c = (await db.execute(select(Course).where(Course.id == course_id))).scalars().first()
    if not c:
        raise HTTPException(status_code=404, detail="Курс табылмады")
    if teacher.role != "ADMIN" and c.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Бұл курс сізге тиесілі емес")
    return c


async def _own_module(db: AsyncSession, teacher: User, module_id: str) -> CourseModule:
    m = (await db.execute(select(CourseModule).where(CourseModule.id == module_id))).scalars().first()
    if not m:
        raise HTTPException(status_code=404, detail="Модуль табылмады")
    await _own_course(db, teacher, m.course_id)
    return m

router = APIRouter(prefix="/teacher", tags=["Teacher"])


async def _teacher_course_ids(db: AsyncSession, teacher_id: str) -> List[str]:
    res = await db.execute(select(Course.id).where(Course.teacher_id == teacher_id))
    return [r[0] for r in res.all()]


@router.get("/stats")
async def get_teacher_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    course_ids = await _teacher_course_ids(db, current_user.id)
    courses_count = len(course_ids)

    students_count = 0
    revenue = 0.0
    avg_score = 0.0
    if course_ids:
        students_count = (await db.execute(
            select(func.count(func.distinct(Enrollment.student_id))).where(Enrollment.course_id.in_(course_ids))
        )).scalar() or 0
        revenue = (await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0.0)).where(
                Payment.item_type == "course", Payment.item_id.in_(course_ids), Payment.status == "completed"
            )
        )).scalar() or 0.0
        test_ids = (await db.execute(select(Test.id).where(Test.course_id.in_(course_ids)))).scalars().all()
        if test_ids:
            avg_score = (await db.execute(
                select(func.coalesce(func.avg(TestAttempt.percentage), 0.0)).where(TestAttempt.test_id.in_(test_ids))
            )).scalar() or 0.0

    return {
        "total_courses": courses_count,
        "active_students": students_count,
        "average_test_score": round(float(avg_score), 1),
        "monthly_revenue_kzt": float(revenue),
    }


@router.get("/courses", response_model=List[TeacherCourseItem])
async def teacher_courses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    res = await db.execute(
        select(Course).where(Course.teacher_id == current_user.id)
        .options(selectinload(Course.modules).selectinload(CourseModule.lessons))
    )
    courses = res.scalars().all()
    out = []
    for c in courses:
        students = (await db.execute(
            select(func.count(Enrollment.id)).where(Enrollment.course_id == c.id)
        )).scalar() or 0
        revenue = (await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0.0)).where(
                Payment.item_id == c.id, Payment.item_type == "course", Payment.status == "completed"
            )
        )).scalar() or 0.0
        lessons = sum(len(m.lessons) for m in c.modules)
        out.append(TeacherCourseItem(
            id=c.id, title=c.title, direction=c.direction, subject=c.subject,
            cover_image=c.cover_image, is_published=c.is_published, students_count=students,
            modules_count=len(c.modules), lessons_count=lessons,
            price=float(c.discount_price or c.price or 0), revenue=float(revenue),
        ))
    return out


@router.get("/students", response_model=List[TeacherStudentItem])
async def teacher_students(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    course_ids = await _teacher_course_ids(db, current_user.id)
    if not course_ids:
        return []
    course_titles = {
        r[0]: r[1] for r in (await db.execute(
            select(Course.id, Course.title).where(Course.id.in_(course_ids))
        )).all()
    }
    enr = (await db.execute(
        select(Enrollment).where(Enrollment.course_id.in_(course_ids))
    )).scalars().all()

    by_student: dict = {}
    for e in enr:
        by_student.setdefault(e.student_id, []).append(e.course_id)
    if not by_student:
        return []

    users = {
        u.id: u for u in (await db.execute(
            select(User).where(User.id.in_(by_student.keys()))
        )).scalars().all()
    }

    # lesson totals for progress
    all_lesson_rows = await db.execute(
        select(CourseModule.course_id, func.count()).select_from(CourseModule)
        .join(CourseModule.lessons).where(CourseModule.course_id.in_(course_ids))
        .group_by(CourseModule.course_id)
    )
    lessons_per_course = {r[0]: r[1] for r in all_lesson_rows.all()}

    test_ids = (await db.execute(select(Test.id).where(Test.course_id.in_(course_ids)))).scalars().all()

    out = []
    for sid, cids in by_student.items():
        u = users.get(sid)
        if not u:
            continue
        total_lessons = sum(lessons_per_course.get(cid, 0) for cid in cids) or 1
        done = (await db.execute(
            select(func.count(LessonProgress.id)).where(
                LessonProgress.student_id == sid, LessonProgress.is_completed == True,  # noqa: E712
            )
        )).scalar() or 0
        pct = round(min(done, total_lessons) / total_lessons * 100, 1)
        last_score = None
        if test_ids:
            last_score = (await db.execute(
                select(TestAttempt.percentage).where(
                    TestAttempt.student_id == sid, TestAttempt.test_id.in_(test_ids)
                ).order_by(TestAttempt.started_at.desc()).limit(1)
            )).scalar()
        paid = (await db.execute(
            select(func.count(Payment.id)).where(
                Payment.student_id == sid, Payment.status == "completed"
            )
        )).scalar() or 0
        status_val = "active"
        if pct < 25:
            status_val = "at_risk"
        out.append(TeacherStudentItem(
            id=sid, full_name=u.full_name, email=u.email, phone=u.phone,
            course_titles=[course_titles.get(c, "") for c in cids],
            progress_pct=pct, last_score=last_score, status=status_val, has_paid=paid > 0,
        ))
    out.sort(key=lambda s: s.full_name)
    return out


@router.get("/analytics")
async def teacher_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    course_ids = await _teacher_course_ids(db, current_user.id)
    revenue = 0.0
    total_students = 0
    completion = 0.0
    avg_score = 0.0
    if course_ids:
        revenue = (await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0.0)).where(
                Payment.item_id.in_(course_ids), Payment.item_type == "course", Payment.status == "completed"
            )
        )).scalar() or 0.0
        total_students = (await db.execute(
            select(func.count(func.distinct(Enrollment.student_id))).where(Enrollment.course_id.in_(course_ids))
        )).scalar() or 0
        test_ids = (await db.execute(select(Test.id).where(Test.course_id.in_(course_ids)))).scalars().all()
        if test_ids:
            avg_score = (await db.execute(
                select(func.coalesce(func.avg(TestAttempt.percentage), 0.0)).where(TestAttempt.test_id.in_(test_ids))
            )).scalar() or 0.0
            completion = (await db.execute(
                select(func.coalesce(func.avg(TestAttempt.percentage), 0.0)).where(
                    TestAttempt.test_id.in_(test_ids), TestAttempt.passed == True,  # noqa: E712
                )
            )).scalar() or 0.0
    return {
        "monthly_revenue_kzt": float(revenue),
        "total_students": total_students,
        "average_test_score": round(float(avg_score), 1),
        "course_completion_rate": round(float(completion), 1),
    }


@router.get("/homework", response_model=List[TeacherHomeworkItem])
async def teacher_homework(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    course_ids = await _teacher_course_ids(db, current_user.id)
    if not course_ids:
        return []
    test_ids = (await db.execute(select(Test.id).where(Test.course_id.in_(course_ids)))).scalars().all()
    if not test_ids:
        return []
    attempts = (await db.execute(
        select(TestAttempt).where(TestAttempt.test_id.in_(test_ids))
        .order_by(TestAttempt.started_at.desc()).limit(25)
    )).scalars().all()
    if not attempts:
        return []
    users = {
        u.id: u.full_name for u in (await db.execute(
            select(User).where(User.id.in_({a.student_id for a in attempts}))
        )).scalars().all()
    }
    titles = {
        r[0]: r[1] for r in (await db.execute(
            select(Test.id, Test.title).where(Test.id.in_({a.test_id for a in attempts}))
        )).all()
    }
    return [
        TeacherHomeworkItem(
            attempt_id=a.id, student_name=users.get(a.student_id, "Оқушы"),
            test_title=titles.get(a.test_id, "Тест"), percentage=a.percentage,
            passed=a.passed, completed_at=a.completed_at,
        )
        for a in attempts
    ]


@router.get("/schedule", response_model=List[LiveSessionItem])
async def teacher_schedule(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    res = await db.execute(
        select(LiveSession).where(LiveSession.teacher_id == current_user.id)
        .order_by(LiveSession.starts_at)
    )
    sessions = res.scalars().all()
    course_titles = {
        r[0]: r[1] for r in (await db.execute(select(Course.id, Course.title))).all()
    }
    return [
        LiveSessionItem(
            id=s.id, title=s.title, course_title=course_titles.get(s.course_id),
            starts_at=s.starts_at, duration_minutes=s.duration_minutes,
            platform=s.platform, url=s.url,
        )
        for s in sessions
    ]


@router.get("/course/{course_id}", response_model=CourseResponse)
async def teacher_course_structure(
    course_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    await _own_course(db, current_user, course_id)
    course = (await db.execute(
        select(Course).where(Course.id == course_id).options(
            selectinload(Course.teacher),
            selectinload(Course.modules).selectinload(CourseModule.lessons).selectinload(Lesson.materials),
        )
    )).scalars().first()
    data = CourseResponse.model_validate(course)
    # attach section/practice/homework tests
    tests = (await db.execute(
        select(Test).where(Test.course_id == course_id).options(selectinload(Test.questions))
    )).scalars().all()
    from app.schemas.schemas import SectionTestRef
    bm = {t.module_id: t for t in tests if t.module_id}
    bl_p = {t.lesson_id: t for t in tests if t.lesson_id and t.kind == "practice"}
    bl_h = {t.lesson_id: t for t in tests if t.lesson_id and t.kind == "homework"}

    def ref(t):
        return SectionTestRef(id=t.id, title=t.title, kind=t.kind, total_questions=len(t.questions),
                              passing_score=t.passing_score)
    for m in data.modules:
        if m.id in bm:
            m.section_test = ref(bm[m.id])
        for l in m.lessons:
            if l.id in bl_p:
                l.practice_test = ref(bl_p[l.id])
            if l.id in bl_h:
                l.homework_test = ref(bl_h[l.id])
    data.is_accessible = True
    return data


@router.post("/modules", status_code=status.HTTP_201_CREATED)
async def create_module(
    body: ModuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    await _own_course(db, current_user, body.course_id)
    mx = (await db.execute(
        select(func.coalesce(func.max(CourseModule.order_index), 0)).where(CourseModule.course_id == body.course_id)
    )).scalar() or 0
    m = CourseModule(course_id=body.course_id, title=body.title, order_index=mx + 1)
    db.add(m)
    await db.commit()
    await db.refresh(m)
    return {"id": m.id, "title": m.title, "order_index": m.order_index}


@router.post("/lessons", status_code=status.HTTP_201_CREATED)
async def create_lesson(
    body: TeacherLessonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    await _own_module(db, current_user, body.module_id)
    mx = (await db.execute(
        select(func.coalesce(func.max(Lesson.order_index), 0)).where(Lesson.module_id == body.module_id)
    )).scalar() or 0
    lesson = Lesson(
        module_id=body.module_id, title=body.title, description=body.description,
        video_url=body.video_url, theory=body.theory, practice=body.practice, homework=body.homework,
        duration_minutes=body.duration_minutes, order_index=mx + 1, is_free_preview=body.is_free_preview,
    )
    db.add(lesson)
    await db.flush()
    for mat in body.materials:
        db.add(LessonMaterial(lesson_id=lesson.id, title=mat.title, file_url=mat.file_url, file_type=mat.file_type))
    await db.commit()
    return {"id": lesson.id, "title": lesson.title}


@router.patch("/lessons/{lesson_id}")
async def update_lesson(
    lesson_id: str,
    body: TeacherLessonUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    lesson = (await db.execute(select(Lesson).where(Lesson.id == lesson_id))).scalars().first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Сабақ табылмады")
    await _own_module(db, current_user, lesson.module_id)
    for field in ("title", "description", "video_url", "theory", "practice", "homework", "duration_minutes"):
        val = getattr(body, field)
        if val is not None:
            setattr(lesson, field, val)
    await db.commit()
    return {"ok": True}


@router.post("/tests", status_code=status.HTTP_201_CREATED)
async def create_test(
    body: TeacherTestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    course = await _own_course(db, current_user, body.course_id)
    if body.module_id:
        await _own_module(db, current_user, body.module_id)
    test = Test(
        course_id=course.id, module_id=body.module_id, lesson_id=body.lesson_id,
        title=body.title, description=body.description, direction=course.direction,
        kind=body.kind, duration_minutes=body.duration_minutes, passing_score=body.passing_score,
        is_published=True,
        due_at=(datetime.now(timezone.utc) + timedelta(days=body.due_in_days)) if body.due_in_days else None,
    )
    db.add(test)
    await db.flush()
    for i, q in enumerate(body.questions, start=1):
        question = Question(
            test_id=test.id, question_text=q.text, question_type=q.question_type,
            points=q.points, explanation=q.explanation, order_index=i,
        )
        db.add(question)
        await db.flush()
        for opt in q.options:
            db.add(AnswerOption(question_id=question.id, option_text=opt.text, is_correct=opt.is_correct))
    await db.commit()
    return {"id": test.id, "title": test.title, "questions": len(body.questions)}


@router.get("/grades", response_model=GradesJournal)
async def teacher_grades(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    course_ids = await _teacher_course_ids(db, current_user.id)
    if not course_ids:
        return GradesJournal()
    tests = (await db.execute(
        select(Test).where(Test.course_id.in_(course_ids), Test.is_published == True)  # noqa: E712
        .order_by(Test.kind, Test.title)
    )).scalars().all()
    test_ids = [t.id for t in tests]

    enr = (await db.execute(
        select(Enrollment.student_id).where(Enrollment.course_id.in_(course_ids)).distinct()
    )).scalars().all()
    students = {
        u.id: u for u in (await db.execute(select(User).where(User.id.in_(set(enr))))).scalars().all()
    }

    grades: dict = {}
    if test_ids and students:
        atts = (await db.execute(
            select(TestAttempt).where(
                TestAttempt.test_id.in_(test_ids), TestAttempt.student_id.in_(students.keys())
            )
        )).scalars().all()
        for a in atts:
            cell = grades.setdefault(a.student_id, {})
            prev = cell.get(a.test_id)
            if not prev or a.percentage > prev["percentage"]:
                cell[a.test_id] = {"percentage": round(a.percentage, 1), "passed": a.passed}

    averages = {
        sid: round(sum(c["percentage"] for c in cells.values()) / len(cells), 1)
        for sid, cells in grades.items() if cells
    }
    return GradesJournal(
        tests=[{"id": t.id, "title": t.title, "kind": t.kind} for t in tests],
        students=sorted(
            [{"id": u.id, "full_name": u.full_name} for u in students.values()],
            key=lambda x: x["full_name"],
        ),
        grades=grades,
        averages=averages,
    )


@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_in: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher),
):
    new_course = Course(
        title=course_in.title,
        description=course_in.description,
        cover_image=course_in.cover_image or "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        direction=course_in.direction,
        subject=course_in.subject,
        level=course_in.level,
        price=course_in.price,
        discount_price=course_in.discount_price,
        teacher_id=current_user.id,
        is_published=True,
    )
    db.add(new_course)
    await db.commit()
    await db.refresh(new_course)
    return new_course
