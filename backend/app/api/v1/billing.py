from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_student
from app.models.models import (
    Course, Enrollment, Notification, Package, Payment, Subscription, User,
)
from app.schemas.schemas import (
    CheckoutRequest, CheckoutResult, PackageResponse, PaymentResponse,
)

router = APIRouter(prefix="/billing", tags=["Billing"])

_METHOD_LABELS = {
    "kaspi_qr": "Kaspi QR",
    "kaspi_012": "Kaspi 0-0-12",
    "card": "Банк картасы",
}


@router.get("/packages", response_model=List[PackageResponse])
async def list_packages(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Package).order_by(Package.order_index))
    return res.scalars().all()


@router.post("/checkout", response_model=CheckoutResult)
async def checkout(
    body: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_student),
):
    method_label = _METHOD_LABELS.get(body.method, "Kaspi QR")

    if body.kind == "course":
        course = (await db.execute(select(Course).where(Course.id == body.id))).scalars().first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Курс табылмады")

        existing = (
            await db.execute(
                select(Enrollment).where(
                    Enrollment.student_id == current_user.id,
                    Enrollment.course_id == course.id,
                )
            )
        ).scalars().first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Сіз бұл курсқа тіркелгенсіз")

        amount = float(course.discount_price or course.price or 0)
        db.add(Enrollment(student_id=current_user.id, course_id=course.id))
        course.total_students = (course.total_students or 0) + 1
        title = course.title
        unlocked = [course.id]

    elif body.kind == "package":
        pkg = (await db.execute(select(Package).where(Package.id == body.id))).scalars().first()
        if not pkg:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пакет табылмады")

        amount = float(pkg.price)
        now = datetime.now(timezone.utc)
        db.add(Subscription(
            student_id=current_user.id,
            plan_name=pkg.name,
            start_date=now,
            end_date=now + timedelta(days=pkg.duration_days or 30),
            is_active=True,
        ))
        title = pkg.name
        # A package unlocks all published UNT courses (handled dynamically by
        # access rules); report them so the client can refresh.
        unt = (await db.execute(
            select(Course.id).where(Course.direction == "UNT", Course.is_published == True)  # noqa: E712
        )).scalars().all()
        unlocked = list(unt)
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="kind: course | package")

    payment = Payment(
        student_id=current_user.id,
        amount=amount,
        currency="KZT",
        status="completed",
        payment_method=method_label,
        item_type=body.kind,
        item_id=body.id,
        item_title=title,
    )
    db.add(payment)
    db.add(Notification(
        user_id=current_user.id,
        title="Төлем сәтті өтті",
        message=f"«{title}» — {amount:,.0f} ₸ ({method_label}). Қолжетімділік ашылды.".replace(",", " "),
        type="payment",
    ))
    await db.commit()
    await db.refresh(payment)

    return CheckoutResult(
        payment=PaymentResponse.model_validate(payment),
        kind=body.kind,
        title=title,
        unlocked_course_ids=unlocked,
    )
