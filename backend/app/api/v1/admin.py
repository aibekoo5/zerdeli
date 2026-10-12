import secrets
from collections import OrderedDict
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.core.security import get_password_hash
from app.models.models import (
    Course, Enrollment, Payment, Subscription, TestAttempt, User,
)
from app.schemas.schemas import (
    AdminAnalytics, AdminCourseCreate, AdminCourseItem, AdminCourseUpdate,
    AdminFinance, AdminMetrics, AdminTeacherItem, AdminUserCreate,
    AdminUserUpdate, MonthPoint, PaymentResponse, PaymentStatusUpdate,
    UserResponse,
)

_VALID_ROLES = {"STUDENT", "TEACHER", "CURATOR", "MANAGER", "ADMIN"}

router = APIRouter(prefix="/admin", tags=["Admin"])


def _month_key(dt: datetime) -> str:
    return dt.strftime("%Y-%m")


@router.get("/metrics", response_model=AdminMetrics)
async def get_admin_metrics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    role_counts = {
        r[0]: r[1] for r in (await db.execute(
            select(User.role, func.count(User.id)).group_by(User.role)
        )).all()
    }
    total_users = sum(role_counts.values())
    total_courses = (await db.execute(select(func.count(Course.id)))).scalar() or 0
    published = (await db.execute(select(func.count(Course.id)).where(Course.is_published == True))).scalar() or 0  # noqa: E712
    attempts = (await db.execute(select(func.count(TestAttempt.id)))).scalar() or 0

    now = datetime.now(timezone.utc)
    active_subs = 0
    for s in (await db.execute(select(Subscription))).scalars().all():
        end = s.end_date
        if end is not None and end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)
        if s.is_active and (end is None or end >= now):
            active_subs += 1

    total_rev = (await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0.0)).where(Payment.status == "completed")
    )).scalar() or 0.0
    month_rev = 0.0
    for p in (await db.execute(select(Payment).where(Payment.status == "completed"))).scalars().all():
        c = p.created_at
        if c and c.tzinfo is None:
            c = c.replace(tzinfo=timezone.utc)
        if c and c.year == now.year and c.month == now.month:
            month_rev += p.amount

    return AdminMetrics(
        total_users=total_users,
        students=role_counts.get("STUDENT", 0),
        teachers=role_counts.get("TEACHER", 0),
        curators=role_counts.get("CURATOR", 0),
        managers=role_counts.get("MANAGER", 0),
        admins=role_counts.get("ADMIN", 0),
        total_courses=total_courses,
        published_courses=published,
        completed_tests=attempts,
        active_subscriptions=active_subs,
        total_revenue_kzt=float(total_rev),
        revenue_this_month_kzt=float(month_rev),
    )


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    role: str = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    query = select(User).order_by(User.created_at.desc())
    if role:
        query = query.where(User.role == role.upper())
    res = await db.execute(query)
    return res.scalars().all()


@router.post("/users", status_code=status.HTTP_201_CREATED)
async def create_user(
    body: AdminUserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    role = body.role.upper()
    if role not in _VALID_ROLES:
        raise HTTPException(status_code=400, detail="Жарамсыз рөл")
    email = body.email.lower().strip()
    if (await db.execute(select(User).where(User.email == email))).scalars().first():
        raise HTTPException(status_code=409, detail="Бұл email тіркелген")
    temp = body.password or secrets.token_urlsafe(6)
    user = User(
        email=email, full_name=body.full_name.strip(), phone=body.phone,
        hashed_password=get_password_hash(temp), role=role,
        preparation_direction=body.preparation_direction,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": user.id, "email": user.email, "role": user.role, "temp_password": temp}


@router.patch("/users/{user_id}")
async def update_user(
    user_id: str,
    body: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    user = (await db.execute(select(User).where(User.id == user_id))).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Пайдаланушы табылмады")
    if user.id == current_user.id and body.is_active is False:
        raise HTTPException(status_code=400, detail="Өзіңізді бұғаттай алмайсыз")
    if body.full_name is not None:
        user.full_name = body.full_name.strip()
    if body.phone is not None:
        user.phone = body.phone or None
    if body.is_active is not None:
        user.is_active = body.is_active
    if body.preparation_direction is not None:
        user.preparation_direction = body.preparation_direction
    if body.curator_id is not None:
        user.curator_id = body.curator_id or None
    await db.commit()
    return {"ok": True}


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: str = Query(..., enum=["STUDENT", "TEACHER", "CURATOR", "MANAGER", "ADMIN"]),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Өз рөліңізді өзгерте алмайсыз")
    res = await db.execute(select(User).where(User.id == user_id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пайдаланушы табылмады")
    user.role = new_role
    await db.commit()
    return {"message": f"Пайдаланушы құқығы {new_role} түріне өзгертілді"}


@router.get("/courses", response_model=List[AdminCourseItem])
async def admin_courses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    courses = (await db.execute(select(Course))).scalars().all()
    teacher_names = {
        u.id: u.full_name for u in (await db.execute(select(User).where(User.role == "TEACHER"))).scalars().all()
    }
    out = []
    for c in courses:
        students = (await db.execute(
            select(func.count(Enrollment.id)).where(Enrollment.course_id == c.id)
        )).scalar() or 0
        revenue = (await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0.0)).where(
                Payment.item_id == c.id, Payment.status == "completed"
            )
        )).scalar() or 0.0
        out.append(AdminCourseItem(
            id=c.id, title=c.title, direction=c.direction,
            teacher_name=teacher_names.get(c.teacher_id), students=students,
            is_published=c.is_published, price=float(c.discount_price or c.price or 0),
            revenue=float(revenue),
        ))
    return out


@router.post("/courses", status_code=status.HTTP_201_CREATED)
async def create_course(
    body: AdminCourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    teacher = (await db.execute(select(User).where(User.id == body.teacher_id))).scalars().first()
    if not teacher or teacher.role not in ("TEACHER", "ADMIN"):
        raise HTTPException(status_code=400, detail="Жарамды мұғалім таңдаңыз")
    course = Course(
        title=body.title, description=body.description, direction=body.direction,
        subject=body.subject, level=body.level, price=body.price,
        discount_price=body.discount_price, teacher_id=teacher.id,
        cover_image=body.cover_image or "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
        is_published=body.is_published,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return {"id": course.id, "title": course.title}


@router.patch("/courses/{course_id}")
async def update_course(
    course_id: str,
    body: AdminCourseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    course = (await db.execute(select(Course).where(Course.id == course_id))).scalars().first()
    if not course:
        raise HTTPException(status_code=404, detail="Курс табылмады")
    if body.teacher_id is not None:
        t = (await db.execute(select(User).where(User.id == body.teacher_id))).scalars().first()
        if not t or t.role not in ("TEACHER", "ADMIN"):
            raise HTTPException(status_code=400, detail="Жарамды мұғалім таңдаңыз")
        course.teacher_id = body.teacher_id
    for field in ("title", "description", "price", "discount_price", "is_published"):
        val = getattr(body, field)
        if val is not None:
            setattr(course, field, val)
    await db.commit()
    return {"ok": True}


@router.patch("/payments/{payment_id}")
async def update_payment(
    payment_id: str,
    body: PaymentStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    if body.status not in ("completed", "refunded", "failed", "pending"):
        raise HTTPException(status_code=400, detail="Жарамсыз статус")
    p = (await db.execute(select(Payment).where(Payment.id == payment_id))).scalars().first()
    if not p:
        raise HTTPException(status_code=404, detail="Төлем табылмады")
    p.status = body.status
    await db.commit()
    return {"ok": True}


@router.get("/finance", response_model=AdminFinance)
async def admin_finance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    payments = (await db.execute(
        select(Payment).order_by(Payment.created_at.desc()).limit(50)
    )).scalars().all()
    total = (await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0.0)).where(Payment.status == "completed")
    )).scalar() or 0.0
    refunded = (await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0.0)).where(Payment.status == "refunded")
    )).scalar() or 0.0
    now = datetime.now(timezone.utc)
    this_month = 0.0
    for p in (await db.execute(select(Payment).where(Payment.status == "completed"))).scalars().all():
        c = p.created_at
        if c and c.tzinfo is None:
            c = c.replace(tzinfo=timezone.utc)
        if c and c.year == now.year and c.month == now.month:
            this_month += p.amount
    return AdminFinance(
        total_revenue=float(total), this_month=float(this_month), refunded=float(refunded),
        payments=[PaymentResponse.model_validate(p) for p in payments],
    )


@router.get("/analytics", response_model=AdminAnalytics)
async def admin_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    months: "OrderedDict[str, MonthPoint]" = OrderedDict()
    for p in (await db.execute(select(Payment).where(Payment.status == "completed"))).scalars().all():
        c = p.created_at
        if c and c.tzinfo is None:
            c = c.replace(tzinfo=timezone.utc)
        if not c:
            continue
        k = _month_key(c)
        months.setdefault(k, MonthPoint(month=k, revenue=0.0, signups=0))
        months[k].revenue += p.amount
    for u in (await db.execute(select(User))).scalars().all():
        c = u.created_at
        if c and c.tzinfo is None:
            c = c.replace(tzinfo=timezone.utc)
        if not c:
            continue
        k = _month_key(c)
        months.setdefault(k, MonthPoint(month=k, revenue=0.0, signups=0))
        months[k].signups += 1

    direction_split = [
        {"direction": r[0], "count": r[1]}
        for r in (await db.execute(
            select(Course.direction, func.count(Course.id)).group_by(Course.direction)
        )).all()
    ]
    role_split = [
        {"role": r[0], "count": r[1]}
        for r in (await db.execute(
            select(User.role, func.count(User.id)).group_by(User.role)
        )).all()
    ]
    ordered = sorted(months.values(), key=lambda m: m.month)
    return AdminAnalytics(months=ordered, direction_split=direction_split, role_split=role_split)


@router.get("/teachers", response_model=List[AdminTeacherItem])
async def admin_teachers(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    teachers = (await db.execute(select(User).where(User.role == "TEACHER"))).scalars().all()
    out = []
    for t in teachers:
        course_ids = (await db.execute(select(Course.id).where(Course.teacher_id == t.id))).scalars().all()
        students = 0
        revenue = 0.0
        if course_ids:
            students = (await db.execute(
                select(func.count(func.distinct(Enrollment.student_id))).where(Enrollment.course_id.in_(course_ids))
            )).scalar() or 0
            revenue = (await db.execute(
                select(func.coalesce(func.sum(Payment.amount), 0.0)).where(
                    Payment.item_id.in_(course_ids), Payment.status == "completed"
                )
            )).scalar() or 0.0
        out.append(AdminTeacherItem(
            id=t.id, full_name=t.full_name, email=t.email, courses=len(course_ids),
            students=students, revenue=float(revenue), is_active=t.is_active,
        ))
    return out
