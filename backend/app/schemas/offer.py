from pydantic import BaseModel, ConfigDict
from typing import Optional
import datetime as dt

class OfferBase(BaseModel):
    drive_id: int
    offer_type: str
    internship_duration_months: Optional[int] = None
    monthly_stipend: Optional[float] = None
    stipend_frequency: Optional[str] = None
    annual_ctc: Optional[float] = None
    fixed_ctc: Optional[float] = None
    variable_ctc: Optional[float] = None
    joining_bonus: Optional[float] = None
    performance_bonus: Optional[float] = None
    ppo_available: bool = False
    ppo_type: Optional[str] = None
    ppo_ctc: Optional[float] = None
    performance_criteria: Optional[str] = None
    joining_date: Optional[dt.date] = None
    offer_status: str
    employment_type: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class OfferCreate(OfferBase):
    pass

class OfferUpdate(BaseModel):
    offer_type: Optional[str] = None
    internship_duration_months: Optional[int] = None
    monthly_stipend: Optional[float] = None
    stipend_frequency: Optional[str] = None
    annual_ctc: Optional[float] = None
    fixed_ctc: Optional[float] = None
    variable_ctc: Optional[float] = None
    joining_bonus: Optional[float] = None
    performance_bonus: Optional[float] = None
    ppo_available: Optional[bool] = None
    ppo_type: Optional[str] = None
    ppo_ctc: Optional[float] = None
    performance_criteria: Optional[str] = None
    joining_date: Optional[dt.date] = None
    offer_status: Optional[str] = None
    employment_type: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class OfferResponse(OfferBase):
    id: int
    created_at: dt.datetime
    
    model_config = ConfigDict(from_attributes=True)
