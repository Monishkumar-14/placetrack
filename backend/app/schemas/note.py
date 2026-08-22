from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class NoteBase(BaseModel):
    drive_id: int
    expected_topics: Optional[str] = None
    company_questions: Optional[str] = None
    previous_questions: Optional[str] = None
    technical_topics: Optional[str] = None
    hr_questions: Optional[str] = None
    projects_to_discuss: Optional[str] = None
    resume_points: Optional[str] = None
    preparation_checklist: Optional[str] = None
    interview_experience: Optional[str] = None
    general_notes: Optional[str] = None

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    expected_topics: Optional[str] = None
    company_questions: Optional[str] = None
    previous_questions: Optional[str] = None
    technical_topics: Optional[str] = None
    hr_questions: Optional[str] = None
    projects_to_discuss: Optional[str] = None
    resume_points: Optional[str] = None
    preparation_checklist: Optional[str] = None
    interview_experience: Optional[str] = None
    general_notes: Optional[str] = None

class NoteResponse(NoteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)
