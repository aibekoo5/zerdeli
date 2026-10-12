from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.models import User, LeaderboardPoint, Subscription
from app.schemas.schemas import UserCreate, UserLogin, Token, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from datetime import datetime, timezone, timedelta

class AuthService:
    @staticmethod
    async def register_user(db: AsyncSession, user_in: UserCreate) -> Token:
        # Check if email exists
        stmt = select(User).where(User.email == user_in.email.lower().strip())
        res = await db.execute(stmt)
        if res.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Бұл электронды пошта жүйеде тіркелген"
            )

        hashed_pw = get_password_hash(user_in.password)
        new_user = User(
            email=user_in.email.lower().strip(),
            full_name=user_in.full_name.strip(),
            phone=user_in.phone,
            hashed_password=hashed_pw,
            # Self sign-up is always STUDENT. Elevated roles come from an admin.
            role="STUDENT",
            preparation_direction=user_in.preparation_direction
        )
        db.add(new_user)
        await db.flush()

        # Initialize LeaderboardPoint & Trial Subscription for students
        if new_user.role == "STUDENT":
            lb = LeaderboardPoint(
                student_id=new_user.id,
                total_points=100, # Welcome bonus
                weekly_points=50,
                monthly_points=100,
                streak_days=1
            )
            db.add(lb)

            sub = Subscription(
                student_id=new_user.id,
                plan_name="NIS & UNT Тегін Сынақ Пакеті",
                start_date=datetime.now(timezone.utc),
                end_date=datetime.now(timezone.utc) + timedelta(days=14),
                is_active=True
            )
            db.add(sub)

        await db.commit()
        await db.refresh(new_user)

        access_token = create_access_token(subject=new_user.id, role=new_user.role)
        refresh_token = create_refresh_token(subject=new_user.id, role=new_user.role)

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserResponse.model_validate(new_user)
        )

    @staticmethod
    async def login_user(db: AsyncSession, user_in: UserLogin) -> Token:
        stmt = select(User).where(User.email == user_in.email.lower().strip())
        res = await db.execute(stmt)
        user = res.scalars().first()

        if not user or not verify_password(user_in.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Электронды пошта немесе құпия сөз қате"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Сіздің аккаунтыңыз бұғатталған"
            )

        user.last_login_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)

        access_token = create_access_token(subject=user.id, role=user.role)
        refresh_token = create_refresh_token(subject=user.id, role=user.role)

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
