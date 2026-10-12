from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.access import test_accessible
from app.core.database import get_db
from app.core.deps import get_current_active_student, get_optional_user
from app.models.models import Course, Test, TestAttempt, User
from app.schemas.schemas import (
    AttemptSummary, TestAttemptResult, TestListItem, TestResponse, TestSubmitRequest,
)
from app.services.access_service import build_access_context
from app.services.test_service import TestService

router = APIRouter(prefix="/tests", tags=["Tests"])


@router.get("", response_model=List[TestListItem])
async def list_tests(
    direction: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    query = (
        select(Test)
        .where(Test.is_published == True)  # noqa: E712
        .options(selectinload(Test.questions))
    )
    if direction and direction.lower() != "all":
        query = query.where(Test.direction == direction)
    tests = (await db.execute(query)).scalars().all()

    ctx = await build_access_context(db, user)

    course_titles = {}
    course_ids = {t.course_id for t in tests if t.course_id}
    if course_ids:
        rows = await db.execute(select(Course.id, Course.title).where(Course.id.in_(course_ids)))
        course_titles = {r[0]: r[1] for r in rows.all()}

    attempts_by_test = {}
    if user:
        a_res = await db.execute(select(TestAttempt).where(TestAttempt.student_id == user.id))
        for a in a_res.scalars().all():
            attempts_by_test.setdefault(a.test_id, []).append(a)

    out = []
    for t in tests:
        atts = attempts_by_test.get(t.id, [])
        best = max((a.percentage for a in atts), default=None)
        out.append(TestListItem(
            id=t.id, title=t.title, description=t.description, direction=t.direction,
            kind=t.kind, duration_minutes=t.duration_minutes, passing_score=t.passing_score,
            total_questions=len(t.questions), course_id=t.course_id,
            course_title=course_titles.get(t.course_id) if t.course_id else "ҰБТ дайындық",
            due_at=t.due_at,
            is_locked=not test_accessible(user, t, ctx.accessible_course_ids, ctx.subscriptions),
            attempts_count=len(atts), best_percentage=best,
        ))
    out.sort(key=lambda x: (x.is_locked, x.kind != "mock", x.title))
    return out


@router.get("/{test_id}", response_model=TestResponse)
async def get_test(
    test_id: str,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    test = await TestService.get_test_by_id(db, test_id)
    ctx = await build_access_context(db, user)
    if not test_accessible(user, test, ctx.accessible_course_ids, ctx.subscriptions):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Бұл сынақ құлыпталған. Ашу үшін тиісті курсты немесе ҰБТ пакетін сатып алыңыз.",
        )
    return test


@router.get("/{test_id}/attempts", response_model=List[AttemptSummary])
async def test_attempts(
    test_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    res = await db.execute(
        select(TestAttempt)
        .where(TestAttempt.student_id == current_user.id, TestAttempt.test_id == test_id)
        .order_by(TestAttempt.started_at.desc())
    )
    attempts = res.scalars().all()
    title = ""
    if attempts:
        t = (await db.execute(select(Test.title).where(Test.id == test_id))).scalar()
        title = t or ""
    return [
        AttemptSummary(
            id=a.id, test_id=a.test_id, test_title=title, score=a.score, max_score=a.max_score,
            percentage=a.percentage, passed=a.passed, completed_at=a.completed_at,
        )
        for a in attempts
    ]


@router.post("/{test_id}/submit", response_model=TestAttemptResult)
async def submit_test(
    test_id: str,
    submit_data: TestSubmitRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    test = await TestService.get_test_by_id(db, test_id)
    ctx = await build_access_context(db, current_user)
    if not test_accessible(current_user, test, ctx.accessible_course_ids, ctx.subscriptions):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Бұл сынақ құлыпталған.",
        )
    return await TestService.submit_test(db, current_user.id, test_id, submit_data)
