from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.courses import router as courses_router
from app.api.v1.tests import router as tests_router
from app.api.v1.students import router as students_router
from app.api.v1.teacher import router as teacher_router
from app.api.v1.admin import router as admin_router
from app.api.v1.billing import router as billing_router
from app.api.v1.manager import router as manager_router
from app.api.v1.curator import router as curator_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(courses_router)
api_v1_router.include_router(tests_router)
api_v1_router.include_router(students_router)
api_v1_router.include_router(teacher_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(billing_router)
api_v1_router.include_router(manager_router)
api_v1_router.include_router(curator_router)
