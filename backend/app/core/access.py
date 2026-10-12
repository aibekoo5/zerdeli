"""Content access rules — who can open which course / test.

A course is accessible when the student is enrolled, or holds an active
subscription (the ҰБТ packages unlock all UNT-direction content), or the course
is free. A test is accessible when its parent course is, or — for the general
ҰБТ mock exams that have no parent course — when the student has an active
subscription. Teachers and admins can open everything.
"""
from datetime import datetime, timezone
from typing import Iterable, Optional

from app.models.models import Course, Subscription, Test, User


def _staff(user: Optional[User]) -> bool:
    return bool(user and user.role in ("TEACHER", "ADMIN"))


def has_active_subscription(subs: Iterable[Subscription]) -> bool:
    now = datetime.now(timezone.utc)
    for s in subs:
        end = s.end_date
        if end is not None and end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)
        if s.is_active and (end is None or end >= now):
            return True
    return False


def course_accessible(
    user: Optional[User],
    course: Course,
    enrolled_course_ids: set[str],
    subs: Iterable[Subscription],
) -> bool:
    if _staff(user):
        return True
    if course.id in enrolled_course_ids:
        return True
    if (course.price or 0) <= 0:
        return True
    if course.direction == "UNT" and has_active_subscription(subs):
        return True
    return False


def test_accessible(
    user: Optional[User],
    test: Test,
    accessible_course_ids: set[str],
    subs: Iterable[Subscription],
) -> bool:
    if _staff(user):
        return True
    if test.is_free:
        return True
    if test.course_id and test.course_id in accessible_course_ids:
        return True
    if test.course_id is None and has_active_subscription(subs):
        return True
    return False
