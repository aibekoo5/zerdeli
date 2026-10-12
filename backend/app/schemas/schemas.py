from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)
    phone: Optional[str] = Field(default=None, max_length=32)
    preparation_direction: str = Field(default="NIS", max_length=16)
    # NOTE: `role` is intentionally NOT accepted from clients. New sign-ups are
    # always STUDENT; elevated roles are assigned by an admin.

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    preparation_direction: Optional[str] = "NIS"
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- LESSON & COURSE SCHEMAS ---
class LessonMaterialResponse(BaseModel):
    id: str
    title: str
    file_url: str
    file_type: str

    class Config:
        from_attributes = True

class LessonProgressResponse(BaseModel):
    id: str
    lesson_id: str
    is_completed: bool
    last_watched_second: int

    class Config:
        from_attributes = True

class SectionTestRef(BaseModel):
    id: str
    title: str
    kind: str
    total_questions: int = 0
    passing_score: int = 70
    is_locked: bool = False
    attempts_count: int = 0
    best_percentage: Optional[float] = None
    passed: bool = False


class LessonResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None
    theory: Optional[str] = None
    practice: Optional[str] = None
    homework: Optional[str] = None
    duration_minutes: int
    order_index: int
    is_free_preview: bool
    is_completed: bool = False
    materials: List[LessonMaterialResponse] = []
    practice_test: Optional[SectionTestRef] = None
    homework_test: Optional[SectionTestRef] = None

    class Config:
        from_attributes = True

class CourseModuleResponse(BaseModel):
    id: str
    title: str
    order_index: int
    lessons: List[LessonResponse] = []
    section_test: Optional[SectionTestRef] = None

    class Config:
        from_attributes = True

class CourseResponse(BaseModel):
    id: str
    title: str
    description: str
    cover_image: Optional[str] = None
    direction: str
    subject: str
    level: str
    price: float
    discount_price: Optional[float] = None
    rating: float
    total_students: int
    is_published: bool
    teacher: Optional[UserResponse] = None
    modules: List[CourseModuleResponse] = []
    is_accessible: bool = False
    is_enrolled: bool = False
    progress_pct: float = 0.0
    total_lessons: int = 0
    completed_lessons: int = 0

    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    title: str
    description: str
    cover_image: Optional[str] = None
    direction: str
    subject: str
    level: str = "Бастапқы"
    price: float = 0.0
    discount_price: Optional[float] = None

# --- TEST SCHEMAS ---
class AnswerOptionResponse(BaseModel):
    id: str
    option_text: str

    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    id: str
    question_text: str
    question_type: str
    points: int
    options: List[AnswerOptionResponse] = []

    class Config:
        from_attributes = True

class QuestionDetailResponse(QuestionResponse):
    explanation: Optional[str] = None
    correct_options: List[str] = []

class TestResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    direction: str
    duration_minutes: int
    passing_score: int
    total_questions: int = 0
    questions: List[QuestionResponse] = []

    class Config:
        from_attributes = True

class AnswerInput(BaseModel):
    question_id: str
    selected_option_ids: List[str] = []
    numerical_answer: Optional[str] = None

class TestSubmitRequest(BaseModel):
    answers: List[AnswerInput]

class TestAnswerResult(BaseModel):
    question_id: str
    question_text: str
    selected_option_ids: List[str]
    numerical_answer: Optional[str] = None
    is_correct: bool
    points_earned: float
    max_points: float
    explanation: Optional[str] = None

class TestAttemptResult(BaseModel):
    attempt_id: str
    test_id: str
    test_title: str
    score: float
    max_score: float
    percentage: float
    passed: bool
    started_at: datetime
    completed_at: datetime
    answers: List[TestAnswerResult] = []

# --- ANALYTICS & LEADERBOARD SCHEMAS ---
class StudentAnalytics(BaseModel):
    overall_progress_percentage: float
    completed_lessons: int
    total_lessons: int
    tests_taken: int
    average_test_score: float
    streak_days: int
    total_points: int
    subject_mastery: List[dict] # [{"subject": "Math", "score": 92}]
    weekly_activity: List[dict] # [{"day": "Дүйсенбі", "minutes": 45}]

class LeaderboardUser(BaseModel):
    rank: int
    student_id: str
    full_name: str
    avatar_url: Optional[str] = None
    preparation_direction: str
    total_points: int
    completed_courses: int
    avg_score: float

class AchievementResponse(BaseModel):
    id: str
    code: str
    title: str
    description: str
    icon: str
    points_reward: int
    is_unlocked: bool = False
    unlocked_at: Optional[datetime] = None

# --- NOTIFICATION & PAYMENT SCHEMAS ---
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentResponse(BaseModel):
    id: str
    amount: float
    currency: str
    status: str
    payment_method: str
    transaction_id: str
    item_type: str = "course"
    item_title: str = ""
    created_at: datetime

    class Config:
        from_attributes = True


# --- PACKAGES & BILLING ---
class PackageResponse(BaseModel):
    id: str
    code: str
    name: str
    subtitle: str
    tier: str
    price: float
    kaspi_month: int
    duration_days: int
    is_popular: bool
    badge: Optional[str] = None
    features: List[str] = []
    not_included: List[str] = []
    order_index: int = 1

    class Config:
        from_attributes = True


class CheckoutRequest(BaseModel):
    kind: str  # "course" | "package"
    id: str
    method: str = "kaspi_qr"  # kaspi_qr | kaspi_012 | card


class CheckoutResult(BaseModel):
    payment: PaymentResponse
    kind: str
    title: str
    unlocked_course_ids: List[str] = []


class SubscriptionResponse(BaseModel):
    id: str
    plan_name: str
    start_date: datetime
    end_date: datetime
    is_active: bool

    class Config:
        from_attributes = True


# --- STUDENT COURSE / DASHBOARD ---
class EnrolledCourseResponse(BaseModel):
    id: str
    title: str
    cover_image: Optional[str] = None
    direction: str
    subject: str
    teacher_name: Optional[str] = None
    total_lessons: int = 0
    completed_lessons: int = 0
    progress_pct: float = 0.0
    next_lesson_id: Optional[str] = None
    is_finished: bool = False
    via: str = "enrollment"  # enrollment | subscription


class DashboardCourse(BaseModel):
    id: str
    title: str
    direction: str
    progress_pct: float
    completed_lessons: int
    total_lessons: int
    next_lesson_id: Optional[str] = None


class DashboardDeadline(BaseModel):
    id: str
    title: str
    kind: str
    course_title: Optional[str] = None
    due_at: Optional[datetime] = None
    is_locked: bool = False


class DashboardAttempt(BaseModel):
    id: str
    test_title: str
    percentage: float
    passed: bool
    completed_at: Optional[datetime] = None


class StudentDashboard(BaseModel):
    full_name: str
    preparation_direction: str
    streak_days: int
    total_points: int
    active_courses: List[DashboardCourse] = []
    upcoming: List[DashboardDeadline] = []
    recent_attempts: List[DashboardAttempt] = []
    subscription: Optional[SubscriptionResponse] = None
    courses_count: int = 0
    lessons_done: int = 0
    avg_score: float = 0.0


class AttemptSummary(BaseModel):
    id: str
    test_id: str
    test_title: str
    score: float
    max_score: float
    percentage: float
    passed: bool
    completed_at: Optional[datetime] = None


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=32)
    preparation_direction: Optional[str] = Field(default=None, max_length=16)
    avatar_url: Optional[str] = Field(default=None, max_length=512)


# --- TEST LIST (with lock state) ---
class TestListItem(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    direction: str
    kind: str
    duration_minutes: int
    passing_score: int
    total_questions: int = 0
    course_id: Optional[str] = None
    course_title: Optional[str] = None
    due_at: Optional[datetime] = None
    is_locked: bool = False
    attempts_count: int = 0
    best_percentage: Optional[float] = None


# --- TEACHER ---
class TeacherCourseItem(BaseModel):
    id: str
    title: str
    direction: str
    subject: str
    cover_image: Optional[str] = None
    is_published: bool
    students_count: int = 0
    modules_count: int = 0
    lessons_count: int = 0
    price: float = 0.0
    revenue: float = 0.0


class TeacherStudentItem(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    course_titles: List[str] = []
    progress_pct: float = 0.0
    last_score: Optional[float] = None
    status: str = "active"  # active, at_risk, trial
    has_paid: bool = False


class TeacherHomeworkItem(BaseModel):
    attempt_id: str
    student_name: str
    test_title: str
    percentage: float
    passed: bool
    completed_at: Optional[datetime] = None


class LiveSessionItem(BaseModel):
    id: str
    title: str
    course_title: Optional[str] = None
    starts_at: datetime
    duration_minutes: int
    platform: str
    url: Optional[str] = None

    class Config:
        from_attributes = True


# --- TEACHER: content builder ---
class ModuleCreate(BaseModel):
    course_id: str
    title: str = Field(min_length=2, max_length=200)


class MaterialInput(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    file_url: str = Field(default="/materials/file.pdf", max_length=500)
    file_type: str = Field(default="PDF", max_length=20)


class TeacherLessonCreate(BaseModel):
    module_id: str
    title: str = Field(min_length=2, max_length=300)
    description: Optional[str] = None
    video_url: Optional[str] = Field(default=None, max_length=500)
    theory: Optional[str] = None
    practice: Optional[str] = None
    homework: Optional[str] = None
    duration_minutes: int = Field(default=15, ge=1, le=300)
    is_free_preview: bool = False
    materials: List[MaterialInput] = []


class TeacherLessonUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=300)
    description: Optional[str] = None
    video_url: Optional[str] = Field(default=None, max_length=500)
    theory: Optional[str] = None
    practice: Optional[str] = None
    homework: Optional[str] = None
    duration_minutes: Optional[int] = Field(default=None, ge=1, le=300)


class QuestionOptionInput(BaseModel):
    text: str = Field(min_length=1, max_length=400)
    is_correct: bool = False


class QuestionInput(BaseModel):
    text: str = Field(min_length=1)
    question_type: str = "single_choice"
    points: int = Field(default=5, ge=1, le=100)
    explanation: Optional[str] = None
    options: List[QuestionOptionInput] = []


class TeacherTestCreate(BaseModel):
    course_id: str
    module_id: Optional[str] = None
    lesson_id: Optional[str] = None
    title: str = Field(min_length=2, max_length=300)
    description: Optional[str] = None
    kind: str = "quiz"
    duration_minutes: int = Field(default=15, ge=1, le=240)
    passing_score: int = Field(default=70, ge=1, le=100)
    due_in_days: Optional[int] = None
    questions: List[QuestionInput] = Field(min_length=1)


class GradeCell(BaseModel):
    test_id: str
    percentage: float
    passed: bool


class GradesJournal(BaseModel):
    tests: List[dict] = []          # [{id, title, kind}]
    students: List[dict] = []       # [{id, full_name}]
    grades: dict = {}               # {student_id: {test_id: {percentage, passed}}}
    averages: dict = {}             # {student_id: avg}


# --- ADMIN ---
class AdminMetrics(BaseModel):
    total_users: int
    students: int
    teachers: int
    curators: int = 0
    managers: int
    admins: int
    total_courses: int
    published_courses: int
    completed_tests: int
    active_subscriptions: int
    total_revenue_kzt: float
    revenue_this_month_kzt: float


class AdminCourseItem(BaseModel):
    id: str
    title: str
    direction: str
    teacher_name: Optional[str] = None
    students: int
    is_published: bool
    price: float
    revenue: float


class AdminFinance(BaseModel):
    total_revenue: float
    this_month: float
    refunded: float
    payments: List[PaymentResponse] = []


class MonthPoint(BaseModel):
    month: str
    revenue: float
    signups: int


class AdminAnalytics(BaseModel):
    months: List[MonthPoint] = []
    direction_split: List[dict] = []
    role_split: List[dict] = []


class AdminTeacherItem(BaseModel):
    id: str
    full_name: str
    email: str
    courses: int
    students: int
    revenue: float
    is_active: bool


class AdminUserCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=32)
    role: str = "STUDENT"
    preparation_direction: str = Field(default="UNT", max_length=16)
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)


class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=32)
    is_active: Optional[bool] = None
    preparation_direction: Optional[str] = Field(default=None, max_length=16)
    curator_id: Optional[str] = None


class AdminCourseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=300)
    description: str = Field(min_length=3)
    direction: str = Field(max_length=16)
    subject: str = Field(max_length=80)
    level: str = Field(default="Орташа", max_length=40)
    price: float = 0.0
    discount_price: Optional[float] = None
    teacher_id: str
    cover_image: Optional[str] = Field(default=None, max_length=500)
    is_published: bool = True


class AdminCourseUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=300)
    description: Optional[str] = None
    price: Optional[float] = None
    discount_price: Optional[float] = None
    teacher_id: Optional[str] = None
    is_published: Optional[bool] = None


class PaymentStatusUpdate(BaseModel):
    status: str  # completed | refunded | failed | pending


# --- MANAGER ---
class LeadResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    grade: Optional[str] = None
    city: Optional[str] = None
    source: str
    interest: str
    stage: str
    note: Optional[str] = None
    converted_user_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LeadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(default="", max_length=32)
    email: Optional[str] = Field(default=None, max_length=120)
    grade: Optional[str] = Field(default=None, max_length=20)
    city: Optional[str] = Field(default=None, max_length=60)
    source: str = Field(default="Сайт", max_length=40)
    interest: str = Field(default="", max_length=120)
    note: Optional[str] = None


class LeadUpdate(BaseModel):
    stage: Optional[str] = None
    note: Optional[str] = None
    phone: Optional[str] = Field(default=None, max_length=32)
    email: Optional[str] = Field(default=None, max_length=120)
    grade: Optional[str] = Field(default=None, max_length=20)
    city: Optional[str] = Field(default=None, max_length=60)
    interest: Optional[str] = Field(default=None, max_length=120)


class LeadConvert(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(default=None, max_length=120)
    kind: Optional[str] = None       # "course" | "package" | None (just create account)
    item_id: Optional[str] = None
    method: str = "kaspi_qr"


class ConvertResult(BaseModel):
    student_id: str
    email: str
    temp_password: str
    enrolled_title: Optional[str] = None


class EnrollStudentRequest(BaseModel):
    kind: str = "course"   # course | package
    item_id: str
    method: str = "kaspi_qr"


class TrialLessonResponse(BaseModel):
    id: str
    student_name: str
    phone: str
    subject: str
    teacher_name: Optional[str] = None
    scheduled_at: datetime
    status: str
    result: Optional[str] = None
    confirmed: bool

    class Config:
        from_attributes = True


class TrialLessonCreate(BaseModel):
    student_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(default="", max_length=32)
    subject: str = Field(default="", max_length=80)
    scheduled_at: datetime


class TrialLessonUpdate(BaseModel):
    status: Optional[str] = None
    result: Optional[str] = None
    confirmed: Optional[bool] = None


class ManagerStudentItem(BaseModel):
    id: str
    full_name: str
    phone: Optional[str] = None
    direction: str
    progress_pct: float = 0.0
    last_score: Optional[float] = None
    has_active_subscription: bool = False
    total_paid: float = 0.0


class ManagerDashboard(BaseModel):
    new_leads: int
    unprocessed_leads: int
    sales_this_month: float
    conversion_pct: float
    debtors: int
    debt_amount: float
    funnel: List[dict] = []


class ManagerPayments(BaseModel):
    collected_this_month: float
    pending: float
    overdue: float
    recent: List[PaymentResponse] = []
    debtors: List[ManagerStudentItem] = []


# --- ERROR WORK (Менің қателерім) ---
class MistakeOption(BaseModel):
    id: str
    text: str
    is_correct: bool


class MistakeItem(BaseModel):
    question_id: str
    question_text: str
    question_type: str
    test_title: str
    your_answer: str
    correct_answer: str
    explanation: Optional[str] = None
    times_wrong: int
    options: List[MistakeOption] = []
    last_wrong_at: Optional[datetime] = None


class MistakeGroup(BaseModel):
    subject: str
    course_id: Optional[str] = None
    total: int
    repeated: int
    fresh: int
    items: List[MistakeItem] = []


class MistakesResponse(BaseModel):
    total_mistakes: int
    repeated: int
    groups: List[MistakeGroup] = []


# --- CURATOR ---
class CuratorStudentItem(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    direction: str
    progress_pct: float = 0.0
    lessons_done: int = 0
    last_login_at: Optional[datetime] = None
    last_lesson_at: Optional[datetime] = None
    unfinished_homework: int = 0
    avg_score: Optional[float] = None
    status: str = "ok"  # ok, attention, inactive


class CuratorDashboard(BaseModel):
    total_students: int
    active_today: int
    needs_attention: int
    inactive: int
    students: List[CuratorStudentItem] = []


class CuratorStudentDetail(BaseModel):
    student: CuratorStudentItem
    courses: List[DashboardCourse] = []
    attempts: List[AttemptSummary] = []
    upcoming: List[DashboardDeadline] = []
    total_mistakes: int = 0
    notifications_sent: int = 0


class CuratorMessage(BaseModel):
    title: str = Field(default="Куратордан хабарлама", max_length=120)
    message: str = Field(min_length=1, max_length=1000)
