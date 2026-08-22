from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.company import PriorityEnum

class CompanyBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.none
    archived: bool = False

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    archived: Optional[bool] = None

class CompanyResponse(CompanyBase):
    id: int
    user_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    drives_count: Optional[int] = 0
    active_drives_count: Optional[int] = 0
    
    model_config = ConfigDict(from_attributes=True)

class CompanyListResponse(BaseModel):
    items: List[CompanyResponse]
    total: int
