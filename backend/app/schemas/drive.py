from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from app.models.drive import DriveTypeEnum, OverallStatusEnum

class DriveBase(BaseModel):
    company_id: int
    job_role: Optional[str] = None
    job_location: Optional[str] = None
    drive_type: Optional[DriveTypeEnum] = DriveTypeEnum.campus
    recruitment_type: Optional[str] = None
    application_date: Optional[datetime] = None
    eligibility_criteria: Optional[str] = None
    cgpa_requirement: Optional[float] = None
    backlogs_allowed: Optional[bool] = False
    branch_eligibility: Optional[str] = None
    vacancies: Optional[int] = None
    current_stage: Optional[str] = None
    overall_status: Optional[OverallStatusEnum] = OverallStatusEnum.interested
    notes: Optional[str] = None

class DriveCreate(DriveBase):
    pass

class DriveUpdate(BaseModel):
    job_role: Optional[str] = None
    job_location: Optional[str] = None
    drive_type: Optional[DriveTypeEnum] = None
    recruitment_type: Optional[str] = None
    application_date: Optional[datetime] = None
    eligibility_criteria: Optional[str] = None
    cgpa_requirement: Optional[float] = None
    backlogs_allowed: Optional[bool] = None
    branch_eligibility: Optional[str] = None
    vacancies: Optional[int] = None
    current_stage: Optional[str] = None
    overall_status: Optional[OverallStatusEnum] = None
    notes: Optional[str] = None

class DriveResponse(DriveBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    company_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class DriveDetailResponse(DriveResponse):
    assessments: List[Any] = []
    interviews: List[Any] = []
    offer: Optional[Any] = None
    events: List[Any] = []
    preparation_notes: Optional[Any] = None
    
    model_config = ConfigDict(from_attributes=True)
