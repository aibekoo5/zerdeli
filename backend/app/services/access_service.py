"""Shared helper: what content a given user can currently open."""
from dataclasses import dataclass, field
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.access import course_accessible
from app.models.models import Course, Enrollment, Subscription, User


@dataclass
class AccessContext:
    user: Optional[User]
    enrolled_course_ids: set = field(default_factory=set)
    accessible_course_ids: set = field(default_factory=set)
    subscriptions: List[Subscription] = field(default_factory=list)


async def build_access_context(db: AsyncSession, user: Optional[User]) -> AccessContext:
    if user is None:
        # Anonymous: only free courses are accessible.
        res = await db.execute(select(Course).where(Course.is_published == True))  # noqa: E712
        courses = res.scalars().all()
        free = {c.id for c in courses if (c.price or 0) <= 0}
        return AccessContext(user=None, accessible_course_ids=free)

    enr_res = await db.execute(select(Enrollment).where(Enrollment.student_id == user.id))
    enrolled_ids = {e.course_id for e in enr_res.scalars().all()}

    sub_res = await db.execute(select(Subscription).where(Subscription.student_id == user.id))
    subs = list(sub_res.scalars().all())

    course_res = await db.execute(select(Course))
    courses = course_res.scalars().all()
    accessible = {
        c.id for c in courses
        if course_accessible(user, c, enrolled_ids, subs)
    }
    return AccessContext(
        user=user,
        enrolled_course_ids=enrolled_ids,
        accessible_course_ids=accessible,
        subscriptions=subs,
    )
