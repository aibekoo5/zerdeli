import secrets
from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_manager
from app.core.security import get_password_hash
from app.models.models import (
    Course, Enrollment, Lead, LessonProgress, Notification, Package, Payment,
    Subscription, TestAttempt, TrialLesson, User,
)
from app.schemas.schemas import (
    ConvertResult, EnrollStudentRequest, LeadConvert, LeadCreate, LeadResponse,
    LeadUpdate, ManagerDashboard, ManagerPayments, ManagerStudentItem,
    PaymentResponse, TrialLessonCreate, TrialLessonResponse, TrialLessonUpdate,
)

_METHOD_LABELS = {"kaspi_qr": "Kaspi QR", "kaspi_012": "Kaspi 0-0-12", "card": "Банк картасы"}


async def _grant_access(db: AsyncSession, student: User, kind: str, item_id: str, method: str) -> str:
    """Enroll a student in a course / activate a package + record a Payment. Returns title."""
    label = _METHOD_LABELS.get(method, "Kaspi QR")
    if kind == "course":
        course = (await db.execute(select(Course).where(Course.id == item_id))).scalars().first()
        if not course:
            raise HTTPException(status_code=404, detail="Курс табылмады")
        exists = (await db.execute(select(Enrollment).where(
            Enrollment.student_id == student.id, Enrollment.course_id == course.id,
        ))).scalars().first()
        if not exists:
            db.add(Enrollment(student_id=student.id, course_id=course.id))
            course.total_students = (course.total_students or 0) + 1
        amount = float(course.discount_price or course.price or 0)
        title = course.title
    elif kind == "package":
        pkg = (await db.execute(select(Package).where(Package.id == item_id))).scalars().first()
        if not pkg:
            raise HTTPException(status_code=404, detail="Пакет табылмады")
        n = datetime.now(timezone.utc)
        db.add(Subscription(student_id=student.id, plan_name=pkg.name, start_date=n,
                            end_date=n + timedelta(days=pkg.duration_days or 30), is_active=True))
        amount = float(pkg.price)
        title = pkg.name
    else:
        raise HTTPException(status_code=400, detail="kind: course | package")

    db.add(Payment(student_id=student.id, amount=amount, currency="KZT", status="completed",
                   payment_method=label, item_type=kind, item_id=item_id, item_title=title))
    db.add(Notification(user_id=student.id, title="Курс ашылды",
                        message=f"«{title}» сізге қолжетімді болды. Оқуды бастаңыз!", type="payment"))
    return title

router = APIRouter(prefix="/manager", tags=["Manager"])

_STAGES = ["new", "contact", "trial", "won", "lost"]


async def _has_active_sub(db: AsyncSession, student_id: str) -> bool:
    now = datetime.now(timezone.utc)
    for s in (await db.execute(
        select(Subscription).where(Subscription.student_id == student_id)
    )).scalars().all():
        end = s.end_date
        if end is not None and end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)
        if s.is_active and (end is None or end >= now):
            return True
    return False


async def _student_items(db: AsyncSession) -> List[ManagerStudentItem]:
    students = (await db.execute(select(User).where(User.role == "STUDENT"))).scalars().all()
    out = []
    for u in students:
        paid = (await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0.0)).where(
                Payment.student_id == u.id, Payment.status == "completed"
            )
        )).scalar() or 0.0
        done = (await db.execute(
            select(func.count(LessonProgress.id)).where(
                LessonProgress.student_id == u.id, LessonProgress.is_completed == True,  # noqa: E712
            )
        )).scalar() or 0
        last_score = (await db.execute(
            select(TestAttempt.percentage).where(TestAttempt.student_id == u.id)
            .order_by(TestAttempt.started_at.desc()).limit(1)
        )).scalar()
        out.append(ManagerStudentItem(
            id=u.id, full_name=u.full_name, phone=u.phone,
            direction=u.preparation_direction or "NIS",
            progress_pct=round(min(done, 30) / 30 * 100, 1),
            last_score=last_score,
            has_active_subscription=await _has_active_sub(db, u.id),
            total_paid=float(paid),
        ))
    return out


@router.get("/dashboard", response_model=ManagerDashboard)
async def manager_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    leads = (await db.execute(select(Lead))).scalars().all()
    now = datetime.now(timezone.utc)
    new_today = 0
    for l in leads:
        c = l.created_at
        if c and c.tzinfo is None:
            c = c.replace(tzinfo=timezone.utc)
        if c and (now - c).days < 1:
            new_today += 1
    unprocessed = sum(1 for l in leads if l.stage == "new")
    won = sum(1 for l in leads if l.stage == "won")
    conversion = round(won / len(leads) * 100, 1) if leads else 0.0

    sales_month = 0.0
    for p in (await db.execute(select(Payment).where(Payment.status == "completed"))).scalars().all():
        c = p.created_at
        if c and c.tzinfo is None:
            c = c.replace(tzinfo=timezone.utc)
        if c and c.year == now.year and c.month == now.month:
            sales_month += p.amount

    students = await _student_items(db)
    debtors = [s for s in students if not s.has_active_subscription and s.total_paid == 0]
    debt_amount = sum(19900 for _ in debtors)

    funnel = [
        {"label": "Жаңа лид", "value": sum(1 for l in leads if l.stage == "new")},
        {"label": "Байланыста", "value": sum(1 for l in leads if l.stage == "contact")},
        {"label": "Сынақ сабақ", "value": sum(1 for l in leads if l.stage == "trial")},
        {"label": "Оқушы болды", "value": won},
    ]
    return ManagerDashboard(
        new_leads=new_today, unprocessed_leads=unprocessed, sales_this_month=sales_month,
        conversion_pct=conversion, debtors=len(debtors), debt_amount=float(debt_amount),
        funnel=funnel,
    )


@router.get("/leads", response_model=List[LeadResponse])
async def list_leads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    res = await db.execute(select(Lead).order_by(Lead.created_at.desc()))
    return res.scalars().all()


@router.post("/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    body: LeadCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    lead = Lead(
        name=body.name, phone=body.phone, source=body.source, interest=body.interest,
        note=body.note, stage="new", assigned_manager_id=current_user.id,
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead


@router.patch("/leads/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: str,
    body: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    lead = (await db.execute(select(Lead).where(Lead.id == lead_id))).scalars().first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Лид табылмады")
    if body.stage is not None:
        if body.stage not in _STAGES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Жарамсыз кезең")
        lead.stage = body.stage
    if body.note is not None:
        lead.note = body.note
    if body.phone is not None:
        lead.phone = body.phone
    await db.commit()
    await db.refresh(lead)
    return lead


@router.get("/leads/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    lead = (await db.execute(select(Lead).where(Lead.id == lead_id))).scalars().first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Лид табылмады")
    return lead


@router.post("/leads/{lead_id}/convert", response_model=ConvertResult)
async def convert_lead(
    lead_id: str,
    body: LeadConvert,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    lead = (await db.execute(select(Lead).where(Lead.id == lead_id))).scalars().first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Лид табылмады")

    email = body.email.lower().strip()
    existing = (await db.execute(select(User).where(User.email == email))).scalars().first()
    temp_pw = secrets.token_urlsafe(6)
    if existing:
        student = existing
    else:
        student = User(
            email=email, full_name=(body.full_name or lead.name).strip(),
            phone=lead.phone, hashed_password=get_password_hash(temp_pw), role="STUDENT",
            preparation_direction="UNT",
        )
        db.add(student)
        await db.flush()
        db.add(Notification(user_id=student.id, title="Zerdeli-ге қош келдіңіз! 🎉",
                            message="Аккаунтыңыз құрылды. Кіру мәліметтерін менеджерден алыңыз.",
                            type="info"))

    enrolled_title = None
    if body.kind and body.item_id:
        enrolled_title = await _grant_access(db, student, body.kind, body.item_id, body.method)

    lead.stage = "won"
    lead.converted_user_id = student.id
    await db.commit()
    return ConvertResult(
        student_id=student.id, email=email,
        temp_password=temp_pw if not existing else "(бар аккаунт)",
        enrolled_title=enrolled_title,
    )


@router.get("/students", response_model=List[ManagerStudentItem])
async def manager_students(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    items = await _student_items(db)
    items.sort(key=lambda s: s.full_name)
    return items


@router.post("/students/{student_id}/enroll")
async def manager_enroll_student(
    student_id: str,
    body: EnrollStudentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    student = (await db.execute(select(User).where(User.id == student_id))).scalars().first()
    if not student or student.role != "STUDENT":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Оқушы табылмады")
    title = await _grant_access(db, student, body.kind, body.item_id, body.method)
    await db.commit()
    return {"ok": True, "title": title}


@router.get("/payments", response_model=ManagerPayments)
async def manager_payments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    now = datetime.now(timezone.utc)
    recent = (await db.execute(
        select(Payment).where(Payment.status == "completed").order_by(Payment.created_at.desc()).limit(15)
    )).scalars().all()
    collected = 0.0
    for p in (await db.execute(select(Payment).where(Payment.status == "completed"))).scalars().all():
        c = p.created_at
        if c and c.tzinfo is None:
            c = c.replace(tzinfo=timezone.utc)
        if c and c.year == now.year and c.month == now.month:
            collected += p.amount

    students = await _student_items(db)
    debtors = [s for s in students if not s.has_active_subscription and s.total_paid == 0]
    return ManagerPayments(
        collected_this_month=float(collected),
        pending=0.0,
        overdue=float(sum(19900 for _ in debtors)),
        recent=[PaymentResponse.model_validate(p) for p in recent],
        debtors=debtors,
    )


@router.get("/trials", response_model=List[TrialLessonResponse])
async def list_trials(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    trials = (await db.execute(select(TrialLesson).order_by(TrialLesson.scheduled_at))).scalars().all()
    teacher_names = {
        u.id: u.full_name for u in (await db.execute(select(User).where(User.role == "TEACHER"))).scalars().all()
    }
    return [
        TrialLessonResponse(
            id=t.id, student_name=t.student_name, phone=t.phone, subject=t.subject,
            teacher_name=teacher_names.get(t.teacher_id), scheduled_at=t.scheduled_at,
            status=t.status, result=t.result, confirmed=t.confirmed,
        )
        for t in trials
    ]


@router.post("/trials", response_model=TrialLessonResponse, status_code=status.HTTP_201_CREATED)
async def create_trial(
    body: TrialLessonCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    trial = TrialLesson(
        student_name=body.student_name, phone=body.phone, subject=body.subject,
        scheduled_at=body.scheduled_at, status="planned",
    )
    db.add(trial)
    await db.commit()
    await db.refresh(trial)
    return TrialLessonResponse(
        id=trial.id, student_name=trial.student_name, phone=trial.phone, subject=trial.subject,
        teacher_name=None, scheduled_at=trial.scheduled_at, status=trial.status,
        result=trial.result, confirmed=trial.confirmed,
    )


@router.patch("/trials/{trial_id}", response_model=TrialLessonResponse)
async def update_trial(
    trial_id: str,
    body: TrialLessonUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_manager),
):
    trial = (await db.execute(select(TrialLesson).where(TrialLesson.id == trial_id))).scalars().first()
    if not trial:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сынақ сабақ табылмады")
    if body.status is not None:
        trial.status = body.status
    if body.result is not None:
        trial.result = body.result
    if body.confirmed is not None:
        trial.confirmed = body.confirmed
    await db.commit()
    await db.refresh(trial)
    return TrialLessonResponse(
        id=trial.id, student_name=trial.student_name, phone=trial.phone, subject=trial.subject,
        teacher_name=None, scheduled_at=trial.scheduled_at, status=trial.status,
        result=trial.result, confirmed=trial.confirmed,
    )
