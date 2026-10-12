from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.rate_limit import rate_limit
from app.core.security import get_password_hash, verify_password
from app.schemas.schemas import ChangePasswordRequest, UserLogin, Token, UserResponse
from app.services.auth_service import AuthService
from app.models.models import User

router = APIRouter(prefix="/auth", tags=["Auth"])

# NOTE: there is no public /register endpoint. Zerdeli accounts are provisioned
# by an admin / the seed script; the platform is login-only by design.


@router.post("/login", response_model=Token)
async def login(request: Request, user_in: UserLogin, db: AsyncSession = Depends(get_db)):
    rate_limit(request, "login", max_calls=8, window_seconds=300)
    return await AuthService.login_user(db, user_in)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password")
async def change_password(
    request: Request,
    body: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rate_limit(request, "change-password", max_calls=8, window_seconds=300)
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Қазіргі құпия сөз қате")
    current_user.hashed_password = get_password_hash(body.new_password)
    db.add(current_user)
    await db.commit()
    return {"ok": True}
