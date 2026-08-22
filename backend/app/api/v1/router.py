from fastapi import APIRouter
from app.api.v1.endpoints import auth, companies, drives, events, assessments, interviews, offers, notes, analytics, export, placements

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(placements.router, prefix="/placements", tags=["placements"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(drives.router, prefix="/drives", tags=["drives"])
api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(offers.router, prefix="/offers", tags=["offers"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(export.router, prefix="/export", tags=["export"])
