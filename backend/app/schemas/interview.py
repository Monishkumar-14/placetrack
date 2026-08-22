from pydantic import BaseModel, ConfigDict
from typing import Optional
import datetime as dt

class InterviewBase(BaseModel):
    drive_id: int
    round_number: Optional[int] = None
    interview_type: str
    date: Optional[dt.date] = None
    start_time: Optional[dt.time] = None
    duration_minutes: Optional[int] = None
    venue_mode: Optional[str] = None
    venue_name: Optional[str] = None
    meeting_link: Optional[str] = None
    interviewer: Optional[str] = None
    status: Optional[str] = None
    result: Optional[str] = None
    shortlisted: Optional[str] = None
    questions_asked: Optional[str] = None
    topics_discussed: Optional[str] = None
    performance: Optional[str] = None
    difficulty: Optional[str] = None
    went_well: Optional[str] = None
    went_wrong: Optional[str] = None
    improvements: Optional[str] = None
    notes: Optional[str] = None

class InterviewCreate(InterviewBase):
    pass

class InterviewUpdate(BaseModel):
    round_number: Optional[int] = None
    interview_type: Optional[str] = None
    date: Optional[dt.date] = None
    start_time: Optional[dt.time] = None
    duration_minutes: Optional[int] = None
    venue_mode: Optional[str] = None
    venue_name: Optional[str] = None
    meeting_link: Optional[str] = None
    interviewer: Optional[str] = None
    status: Optional[str] = None
    result: Optional[str] = None
    shortlisted: Optional[str] = None
    questions_asked: Optional[str] = None
    topics_discussed: Optional[str] = None
    performance: Optional[str] = None
    difficulty: Optional[str] = None
    went_well: Optional[str] = None
    went_wrong: Optional[str] = None
    improvements: Optional[str] = None
    notes: Optional[str] = None

class InterviewResponse(InterviewBase):
    id: int
    created_at: dt.datetime
    
    model_config = ConfigDict(from_attributes=True)
