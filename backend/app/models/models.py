import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Table, JSON
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[str] = mapped_column(String, default="STUDENT") # STUDENT, TEACHER, CURATOR, MANAGER, ADMIN
    preparation_direction: Mapped[Optional[str]] = mapped_column(String, default="NIS") # NIS, BIL, RFMSH, UNT
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # student -> assigned curator (self-referential)
    curator_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    # Relationships
    taught_courses: Mapped[List["Course"]] = relationship("Course", back_populates="teacher")
    enrollments: Mapped[List["Enrollment"]] = relationship("Enrollment", back_populates="student")
    lesson_progresses: Mapped[List["LessonProgress"]] = relationship("LessonProgress", back_populates="student")
    test_attempts: Mapped[List["TestAttempt"]] = relationship("TestAttempt", back_populates="student")
    subscriptions: Mapped[List["Subscription"]] = relationship("Subscription", back_populates="student")
    payments: Mapped[List["Payment"]] = relationship("Payment", back_populates="student")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="student")
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="user")
    achievements: Mapped[List["StudentAchievement"]] = relationship("StudentAchievement", back_populates="student")
    leaderboard_point: Mapped[Optional["LeaderboardPoint"]] = relationship("LeaderboardPoint", back_populates="student", uselist=False)


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    cover_image: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    direction: Mapped[str] = mapped_column(String, nullable=False) # NIS, BIL, RFMSH, UNT
    subject: Mapped[str] = mapped_column(String, nullable=False) # Math, Physics, Chemistry, etc.
    level: Mapped[str] = mapped_column(String, default="Бастапқы") # Бастапқы, Орташа, Жоғары
    price: Mapped[float] = mapped_column(Float, default=0.0)
    discount_price: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=4.9)
    total_students: Mapped[int] = mapped_column(Integer, default=0)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    teacher_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    teacher: Mapped["User"] = relationship("User", back_populates="taught_courses")
    modules: Mapped[List["CourseModule"]] = relationship("CourseModule", back_populates="course", cascade="all, delete-orphan")
    enrollments: Mapped[List["Enrollment"]] = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="course", cascade="all, delete-orphan")


class CourseModule(Base):
    __tablename__ = "course_modules"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    course_id: Mapped[str] = mapped_column(String, ForeignKey("courses.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=1)

    course: Mapped["Course"] = relationship("Course", back_populates="modules")
    lessons: Mapped[List["Lesson"]] = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    module_id: Mapped[str] = mapped_column(String, ForeignKey("course_modules.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    video_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    theory: Mapped[Optional[str]] = mapped_column(Text, nullable=True)     # 📄 Теория (markdown)
    practice: Mapped[Optional[str]] = mapped_column(Text, nullable=True)   # ✏️ Практика (markdown)
    homework: Mapped[Optional[str]] = mapped_column(Text, nullable=True)   # 📝 Үй жұмысы (markdown)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=15)
    order_index: Mapped[int] = mapped_column(Integer, default=1)
    is_free_preview: Mapped[bool] = mapped_column(Boolean, default=False)

    module: Mapped["CourseModule"] = relationship("CourseModule", back_populates="lessons")
    materials: Mapped[List["LessonMaterial"]] = relationship("LessonMaterial", back_populates="lesson", cascade="all, delete-orphan")
    progresses: Mapped[List["LessonProgress"]] = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class LessonMaterial(Base):
    __tablename__ = "lesson_materials"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    lesson_id: Mapped[str] = mapped_column(String, ForeignKey("lessons.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    file_url: Mapped[str] = mapped_column(String, nullable=False)
    file_type: Mapped[str] = mapped_column(String, default="PDF")

    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="materials")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    lesson_id: Mapped[str] = mapped_column(String, ForeignKey("lessons.id"), nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    last_watched_second: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    student: Mapped["User"] = relationship("User", back_populates="lesson_progresses")
    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="progresses")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    course_id: Mapped[str] = mapped_column(String, ForeignKey("courses.id"), nullable=False)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    student: Mapped["User"] = relationship("User", back_populates="enrollments")
    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")


class Test(Base):
    __tablename__ = "tests"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    course_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("courses.id"), nullable=True)
    module_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("course_modules.id"), nullable=True)
    lesson_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("lessons.id"), nullable=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    direction: Mapped[str] = mapped_column(String, default="NIS") # NIS, BIL, RFMSH, UNT
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    passing_score: Mapped[int] = mapped_column(Integer, default=70) # percentage
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    # quiz, practice, homework, section, trial (сынақ), monthly (айлық), final (қорытынды), mock, topic
    kind: Mapped[str] = mapped_column(String, default="topic")
    is_free: Mapped[bool] = mapped_column(Boolean, default=False)  # free preview, no purchase needed
    due_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    questions: Mapped[List["Question"]] = relationship("Question", back_populates="test", cascade="all, delete-orphan")
    attempts: Mapped[List["TestAttempt"]] = relationship("TestAttempt", back_populates="test", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    test_id: Mapped[str] = mapped_column(String, ForeignKey("tests.id"), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String, default="single_choice") # single_choice, multiple_choice, numerical, true_false
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    points: Mapped[int] = mapped_column(Integer, default=1)
    order_index: Mapped[int] = mapped_column(Integer, default=1)

    test: Mapped["Test"] = relationship("Test", back_populates="questions")
    options: Mapped[List["AnswerOption"]] = relationship("AnswerOption", back_populates="question", cascade="all, delete-orphan")


class AnswerOption(Base):
    __tablename__ = "answer_options"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    question_id: Mapped[str] = mapped_column(String, ForeignKey("questions.id"), nullable=False)
    option_text: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)

    question: Mapped["Question"] = relationship("Question", back_populates="options")


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    test_id: Mapped[str] = mapped_column(String, ForeignKey("tests.id"), nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0)
    max_score: Mapped[float] = mapped_column(Float, default=0.0)
    percentage: Mapped[float] = mapped_column(Float, default=0.0)
    passed: Mapped[bool] = mapped_column(Boolean, default=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    student: Mapped["User"] = relationship("User", back_populates="test_attempts")
    test: Mapped["Test"] = relationship("Test", back_populates="attempts")
    answers: Mapped[List["TestAnswer"]] = relationship("TestAnswer", back_populates="attempt", cascade="all, delete-orphan")


class TestAnswer(Base):
    __tablename__ = "test_answers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    attempt_id: Mapped[str] = mapped_column(String, ForeignKey("test_attempts.id"), nullable=False)
    question_id: Mapped[str] = mapped_column(String, ForeignKey("questions.id"), nullable=False)
    selected_option_ids: Mapped[Optional[str]] = mapped_column(Text, nullable=True) # JSON list string
    numerical_answer: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False)
    points_earned: Mapped[float] = mapped_column(Float, default=0.0)

    attempt: Mapped["TestAttempt"] = relationship("TestAttempt", back_populates="answers")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    plan_name: Mapped[str] = mapped_column(String, default="Standard NIS & UNT")
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    student: Mapped["User"] = relationship("User", back_populates="subscriptions")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String, default="KZT")
    status: Mapped[str] = mapped_column(String, default="completed") # pending, completed, failed, refunded
    payment_method: Mapped[str] = mapped_column(String, default="Kaspi QR")
    transaction_id: Mapped[str] = mapped_column(String, unique=True, default=generate_uuid)
    item_type: Mapped[str] = mapped_column(String, default="course")  # course, package
    item_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    item_title: Mapped[str] = mapped_column(String, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    student: Mapped["User"] = relationship("User", back_populates="payments")


class Package(Base):
    __tablename__ = "packages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    subtitle: Mapped[str] = mapped_column(String, default="")
    tier: Mapped[str] = mapped_column(String, default="standard")  # standard, pro, vip
    price: Mapped[float] = mapped_column(Float, nullable=False)
    kaspi_month: Mapped[int] = mapped_column(Integer, default=0)
    duration_days: Mapped[int] = mapped_column(Integer, default=30)
    is_popular: Mapped[bool] = mapped_column(Boolean, default=False)
    badge: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    features: Mapped[list] = mapped_column(JSON, default=list)
    not_included: Mapped[list] = mapped_column(JSON, default=list)
    order_index: Mapped[int] = mapped_column(Integer, default=1)


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, default="")
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String, nullable=True)   # сынып
    city: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    source: Mapped[str] = mapped_column(String, default="Сайт")
    interest: Mapped[str] = mapped_column(String, default="")
    stage: Mapped[str] = mapped_column(String, default="new")  # new, contact, trial, won, lost
    assigned_manager_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    converted_user_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class TrialLesson(Base):
    __tablename__ = "trial_lessons"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    student_name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str] = mapped_column(String, default="")
    subject: Mapped[str] = mapped_column(String, default="")
    teacher_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    status: Mapped[str] = mapped_column(String, default="planned")  # planned, done
    result: Mapped[Optional[str]] = mapped_column(String, nullable=True)  # enrolled, thinking, declined
    confirmed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class LiveSession(Base):
    __tablename__ = "live_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    course_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("courses.id"), nullable=True)
    teacher_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60)
    platform: Mapped[str] = mapped_column(String, default="Zoom")
    url: Mapped[Optional[str]] = mapped_column(String, nullable=True)


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    course_id: Mapped[str] = mapped_column(String, ForeignKey("courses.id"), nullable=False)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, default=5)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    course: Mapped["Course"] = relationship("Course", back_populates="reviews")
    student: Mapped["User"] = relationship("User", back_populates="reviews")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String, default="info") # info, test_result, achievement, lesson
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    user: Mapped["User"] = relationship("User", back_populates="notifications")


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    icon: Mapped[str] = mapped_column(String, default="🏆")
    points_reward: Mapped[int] = mapped_column(Integer, default=50)

    student_achievements: Mapped[List["StudentAchievement"]] = relationship("StudentAchievement", back_populates="achievement")


class StudentAchievement(Base):
    __tablename__ = "student_achievements"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    achievement_id: Mapped[str] = mapped_column(String, ForeignKey("achievements.id"), nullable=False)
    unlocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    student: Mapped["User"] = relationship("User", back_populates="achievements")
    achievement: Mapped["Achievement"] = relationship("Achievement", back_populates="student_achievements")


class LeaderboardPoint(Base):
    __tablename__ = "leaderboard_points"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_uuid)
    student_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), unique=True, nullable=False)
    total_points: Mapped[int] = mapped_column(Integer, default=0)
    weekly_points: Mapped[int] = mapped_column(Integer, default=0)
    monthly_points: Mapped[int] = mapped_column(Integer, default=0)
    streak_days: Mapped[int] = mapped_column(Integer, default=1)
    last_activity_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    student: Mapped["User"] = relationship("User", back_populates="leaderboard_point")
