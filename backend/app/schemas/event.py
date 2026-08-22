from pydantic import BaseModel, ConfigDict
from typing import Optional
import datetime as dt
from app.models.event import EventStatusEnum

class EventBase(BaseModel):
    drive_id: int
    event_type: str
    title: str
    date: dt.date
    start_time: Optional[dt.time] = None
    end_time: Optional[dt.time] = None
    venue_mode: Optional[str] = None
    venue_name: Optional[str] = None
    room: Optional[str] = None
    building: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    platform: Optional[str] = None
    attendance_required: bool = False
    status: EventStatusEnum = EventStatusEnum.upcoming
    notes: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    event_type: Optional[str] = None
    title: Optional[str] = None
    date: Optional[dt.date] = None
    start_time: Optional[dt.time] = None
    end_time: Optional[dt.time] = None
    venue_mode: Optional[str] = None
    venue_name: Optional[str] = None
    room: Optional[str] = None
    building: Optional[str] = None
    location: Optional[str] = None
    meeting_link: Optional[str] = None
    platform: Optional[str] = None
    attendance_required: Optional[bool] = None
    status: Optional[EventStatusEnum] = None
    notes: Optional[str] = None

class EventResponse(EventBase):
    id: int
    created_at: dt.datetime
    company_name: Optional[str] = None
    drive_job_role: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
