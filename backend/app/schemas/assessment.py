from pydantic import BaseModel, ConfigDict
from typing import Optional
import datetime as dt

class AssessmentBase(BaseModel):
    drive_id: int
    assessment_name: str
    assessment_type: str
    round_number: Optional[int] = None
    date: Optional[dt.date] = None
    start_time: Optional[dt.time] = None
    duration_minutes: Optional[int] = None
    venue_mode: Optional[str] = None
    venue_name: Optional[str] = None
    platform: Optional[str] = None
    total_questions: Optional[int] = None
    total_marks: Optional[float] = None
    negative_marking: bool = False
    programming_languages: Optional[str] = None
    difficulty: Optional[str] = None
    result_date: Optional[dt.date] = None
    result: Optional[str] = None
    shortlisted: Optional[str] = None
    score: Optional[float] = None
    max_score: Optional[float] = None
    percentage: Optional[float] = None
    rank: Optional[int] = None
    percentile: Optional[float] = None
    questions_attempted: Optional[int] = None
    questions_correct: Optional[int] = None
    notes: Optional[str] = None

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentUpdate(BaseModel):
    assessment_name: Optional[str] = None
    assessment_type: Optional[str] = None
    round_number: Optional[int] = None
    date: Optional[dt.date] = None
    start_time: Optional[dt.time] = None
    duration_minutes: Optional[int] = None
    venue_mode: Optional[str] = None
    venue_name: Optional[str] = None
    platform: Optional[str] = None
    total_questions: Optional[int] = None
    total_marks: Optional[float] = None
    negative_marking: Optional[bool] = None
    programming_languages: Optional[str] = None
    difficulty: Optional[str] = None
    result_date: Optional[dt.date] = None
    result: Optional[str] = None
    shortlisted: Optional[str] = None
    score: Optional[float] = None
    max_score: Optional[float] = None
    percentage: Optional[float] = None
    rank: Optional[int] = None
    percentile: Optional[float] = None
    questions_attempted: Optional[int] = None
    questions_correct: Optional[int] = None
    notes: Optional[str] = None

class AssessmentResponse(AssessmentBase):
    id: int
    created_at: dt.datetime
    
    model_config = ConfigDict(from_attributes=True)
