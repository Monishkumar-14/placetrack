from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import date, timedelta
from app.db.session import get_db
from app.models.event import Event
from app.models.drive import PlacementDrive
from app.models.company import Company
from app.schemas.event import EventCreate, EventUpdate, EventResponse
from app.deps import get_current_user
from app.models.user import User

router = APIRouter()


def _enrich_event(event, company_name=None, job_role=None):
    """Add company_name and drive_job_role to event object for response"""
    event.company_name = company_name
    event.drive_job_role = job_role
    return event


@router.get("", response_model=List[EventResponse])
async def list_events(
    event_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all events with optional type filter"""
    stmt = (
        select(Event, Company.name.label("company_name"), PlacementDrive.job_role.label("job_role"))
        .join(PlacementDrive, Event.drive_id == PlacementDrive.id)
        .join(Company, PlacementDrive.company_id == Company.id)
        .where(Company.user_id == current_user.id)
    )
    if event_type:
        stmt = stmt.where(Event.event_type == event_type)
    stmt = stmt.order_by(Event.date.desc())

    result = await db.execute(stmt)
    rows = result.all()
    return [_enrich_event(event, cn, jr) for event, cn, jr in rows]


@router.get("/upcoming", response_model=List[EventResponse])
async def upcoming_events(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get upcoming events in the next 14 days"""
    today = date.today()
    future = today + timedelta(days=14)
    stmt = (
        select(Event, Company.name.label("company_name"), PlacementDrive.job_role.label("job_role"))
        .join(PlacementDrive, Event.drive_id == PlacementDrive.id)
        .join(Company, PlacementDrive.company_id == Company.id)
        .where(Company.user_id == current_user.id, Event.date >= today, Event.date <= future)
        .order_by(Event.date, Event.start_time)
    )
    result = await db.execute(stmt)
    rows = result.all()
    return [_enrich_event(event, cn, jr) for event, cn, jr in rows]


@router.post("", response_model=EventResponse)
async def create_event(req: EventCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new event"""
    event = Event(**req.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)

    # Fetch company name
    drive = await db.execute(
        select(PlacementDrive, Company.name)
        .join(Company)
        .where(PlacementDrive.id == event.drive_id)
    )
    row = drive.first()
    if row:
        event.company_name = row[1]
        event.drive_job_role = row[0].job_role
    return event


@router.put("/{id}", response_model=EventResponse)
async def update_event(id: int, req: EventUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update an event"""
    stmt = select(Event).where(Event.id == id)
    event = (await db.execute(stmt)).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    for k, v in req.model_dump(exclude_unset=True).items():
        setattr(event, k, v)
    await db.commit()
    await db.refresh(event)
    return event


@router.delete("/{id}")
async def delete_event(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete an event"""
    stmt = select(Event).where(Event.id == id)
    event = (await db.execute(stmt)).scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await db.delete(event)
    await db.commit()
    return {"message": "Event deleted"}
