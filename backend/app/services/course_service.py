from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from app.models.models import Course, CourseModule, Lesson, LessonProgress, Enrollment, User
from app.schemas.schemas import CourseCreate

class CourseService:
    @staticmethod
    async def get_courses(
        db: AsyncSession,
        direction: Optional[str] = None,
        subject: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Course]:
        query = select(Course).where(Course.is_published == True).options(
            selectinload(Course.teacher),
            selectinload(Course.modules).selectinload(CourseModule.lessons).selectinload(Lesson.materials)
        )
        if direction and direction.lower() != 'all':
            query = query.where(Course.direction == direction)
        if subject and subject.lower() != 'all':
            query = query.where(Course.subject.ilike(f"%{subject}%"))
        if search:
            query = query.where(Course.title.ilike(f"%{search}%") | Course.description.ilike(f"%{search}%"))

        res = await db.execute(query.order_index if hasattr(Course, 'order_index') else query)
        return res.scalars().all()

    @staticmethod
    async def get_course_by_id(db: AsyncSession, course_id: str) -> Course:
        query = select(Course).where(Course.id == course_id).options(
            selectinload(Course.teacher),
            selectinload(Course.modules).selectinload(CourseModule.lessons).selectinload(Lesson.materials)
        )
        res = await db.execute(query)
        course = res.scalars().first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Курс табылмады")
        return course

    @staticmethod
    async def enroll_student(db: AsyncSession, student_id: str, course_id: str):
        stmt = select(Enrollment).where(Enrollment.student_id == student_id, Enrollment.course_id == course_id)
        res = await db.execute(stmt)
        if res.scalars().first():
            return True # Already enrolled

        enrollment = Enrollment(student_id=student_id, course_id=course_id)
        db.add(enrollment)
        
        # Increment total students
        c_stmt = select(Course).where(Course.id == course_id)
        c_res = await db.execute(c_stmt)
        course = c_res.scalars().first()
        if course:
            course.total_students += 1
            
        await db.commit()
        return True

    @staticmethod
    async def update_lesson_progress(
        db: AsyncSession,
        student_id: str,
        lesson_id: str,
        is_completed: bool,
        last_watched_second: int = 0
    ):
        stmt = select(LessonProgress).where(
            LessonProgress.student_id == student_id,
            LessonProgress.lesson_id == lesson_id
        )
        res = await db.execute(stmt)
        progress = res.scalars().first()

        if not progress:
            progress = LessonProgress(
                student_id=student_id,
                lesson_id=lesson_id,
                is_completed=is_completed,
                last_watched_second=last_watched_second
            )
            db.add(progress)
        else:
            progress.is_completed = is_completed or progress.is_completed
            progress.last_watched_second = max(progress.last_watched_second, last_watched_second)

        await db.commit()
        return progress
