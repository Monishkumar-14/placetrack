from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import init_db, async_session
from app.models.user import User
from app.core.security import get_password_hash
from sqlalchemy.future import select

app = FastAPI(
    title="Placement Drive Management System",
    description="Backend API for Placement Drive Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    await init_db()
    async with async_session() as db:
        stmt = select(User).where(User.email == "admin@placement.dev")
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()
        if not user:
            admin_user = User(
                name="Placement Admin",
                email="admin@placement.dev",
                password_hash=get_password_hash("password123")
            )
            db.add(admin_user)
            await db.commit()
