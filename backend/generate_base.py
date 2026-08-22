import os
import sys

base_dir = r"c:\Users\nivet\Desktop\drive-management\backend"

files = {
    "requirements.txt": """fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy[asyncio]==2.0.35
aiosqlite==0.20.0
alembic==1.13.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic==2.9.0
pydantic-settings==2.5.0
python-multipart==0.0.9
openpyxl==3.1.5
reportlab==4.2.0
httpx==0.27.0
pytest==8.3.0
pytest-asyncio==0.24.0""",
    
    ".env": """DATABASE_URL=sqlite+aiosqlite:///./placement.db
SECRET_KEY=super-secret-key-change-in-production-abc123xyz
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:5173,http://localhost:3000""",

    "app/__init__.py": "",
    
    "app/core/__init__.py": "",
    
    "app/core/config.py": """from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./placement.db"
    SECRET_KEY: str = "super-secret-key-change-in-production-abc123xyz"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()""",

    "app/core/security.py": """from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt""",

    "app/db/__init__.py": "",
    
    "app/db/base.py": """from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData

convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s"
}

class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=convention)""",

    "app/db/session.py": """from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
from app.db.base import Base
from typing import AsyncGenerator

engine = create_async_engine(settings.DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)""",

    "app/models/__init__.py": """from app.models.user import User
from app.models.company import Company
from app.models.drive import PlacementDrive
from app.models.event import Event
from app.models.assessment import Assessment
from app.models.interview import Interview
from app.models.offer import Offer
from app.models.note import Note""",

    "app/models/user.py": """from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())""",

    "app/models/company.py": """from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class PriorityEnum(str, enum.Enum):
    high = "high"
    medium = "medium"
    low = "low"
    none = "none"

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True, nullable=False)
    logo_url = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    website = Column(String, nullable=True)
    description = Column(String, nullable=True)
    priority = Column(SQLEnum(PriorityEnum), default=PriorityEnum.none)
    archived = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    drives = relationship("PlacementDrive", back_populates="company", cascade="all, delete-orphan")""",

    "app/models/drive.py": """from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class DriveTypeEnum(str, enum.Enum):
    campus = "campus"
    off_campus = "off_campus"
    internship = "internship"
    full_time = "full_time"
    internship_ppo = "internship_ppo"
    internship_performance_ppo = "internship_performance_ppo"

class OverallStatusEnum(str, enum.Enum):
    interested = "interested"
    applied = "applied"
    ppt_scheduled = "ppt_scheduled"
    assessment_scheduled = "assessment_scheduled"
    assessment_completed = "assessment_completed"
    shortlisted = "shortlisted"
    interview_scheduled = "interview_scheduled"
    interview_completed = "interview_completed"
    offer_received = "offer_received"
    offer_accepted = "offer_accepted"
    rejected = "rejected"
    withdrawn = "withdrawn"
    completed = "completed"

class PlacementDrive(Base):
    __tablename__ = "drives"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"))
    job_role = Column(String, nullable=False)
    job_location = Column(String, nullable=True)
    drive_type = Column(SQLEnum(DriveTypeEnum), default=DriveTypeEnum.campus)
    recruitment_type = Column(String, nullable=True)
    application_date = Column(DateTime(timezone=True), nullable=True)
    eligibility_criteria = Column(String, nullable=True)
    cgpa_requirement = Column(Float, nullable=True)
    backlogs_allowed = Column(Boolean, default=False)
    branch_eligibility = Column(String, nullable=True)
    vacancies = Column(Integer, nullable=True)
    current_stage = Column(String, nullable=True)
    overall_status = Column(SQLEnum(OverallStatusEnum), default=OverallStatusEnum.interested)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="drives")
    events = relationship("Event", back_populates="drive", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="drive", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="drive", cascade="all, delete-orphan")
    offer = relationship("Offer", uselist=False, back_populates="drive", cascade="all, delete-orphan")
    preparation_notes = relationship("Note", uselist=False, back_populates="drive", cascade="all, delete-orphan")""",

    "app/models/event.py": """from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Time, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base import Base

class EventStatusEnum(str, enum.Enum):
    upcoming = "upcoming"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"
    rescheduled = "rescheduled"

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("drives.id", ondelete="CASCADE"))
    event_type = Column(String, nullable=False)  # ppt/assessment/interview/result/offer/joining/other
    title = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    venue_mode = Column(String, nullable=True)
    venue_name = Column(String, nullable=True)
    room = Column(String, nullable=True)
    building = Column(String, nullable=True)
    location = Column(String, nullable=True)
    meeting_link = Column(String, nullable=True)
    platform = Column(String, nullable=True)
    attendance_required = Column(Boolean, default=False)
    status = Column(SQLEnum(EventStatusEnum), default=EventStatusEnum.upcoming)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    drive = relationship("PlacementDrive", back_populates="events")""",

    "app/models/assessment.py": """from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("drives.id", ondelete="CASCADE"))
    assessment_name = Column(String, nullable=False)
    assessment_type = Column(String, nullable=False)
    round_number = Column(Integer, nullable=True)
    date = Column(Date, nullable=True)
    start_time = Column(Time, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    venue_mode = Column(String, nullable=True)
    venue_name = Column(String, nullable=True)
    platform = Column(String, nullable=True)
    total_questions = Column(Integer, nullable=True)
    total_marks = Column(Float, nullable=True)
    negative_marking = Column(Boolean, default=False)
    programming_languages = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    result_date = Column(Date, nullable=True)
    result = Column(String, nullable=True)
    shortlisted = Column(String, nullable=True) # yes/no/pending
    score = Column(Float, nullable=True)
    max_score = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True)
    rank = Column(Integer, nullable=True)
    percentile = Column(Float, nullable=True)
    questions_attempted = Column(Integer, nullable=True)
    questions_correct = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    drive = relationship("PlacementDrive", back_populates="assessments")""",

    "app/models/interview.py": """from sqlalchemy import Column, Integer, String, DateTime, Date, Time, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("drives.id", ondelete="CASCADE"))
    round_number = Column(Integer, nullable=True)
    interview_type = Column(String, nullable=False)
    date = Column(Date, nullable=True)
    start_time = Column(Time, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    venue_mode = Column(String, nullable=True)
    venue_name = Column(String, nullable=True)
    meeting_link = Column(String, nullable=True)
    interviewer = Column(String, nullable=True)
    status = Column(String, nullable=True)
    result = Column(String, nullable=True)
    shortlisted = Column(String, nullable=True)
    questions_asked = Column(Text, nullable=True)
    topics_discussed = Column(Text, nullable=True)
    performance = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    went_well = Column(Text, nullable=True)
    went_wrong = Column(Text, nullable=True)
    improvements = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    drive = relationship("PlacementDrive", back_populates="interviews")""",

    "app/models/offer.py": """from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("drives.id", ondelete="CASCADE"), unique=True)
    offer_type = Column(String, nullable=False)
    internship_duration_months = Column(Integer, nullable=True)
    monthly_stipend = Column(Float, nullable=True)
    stipend_frequency = Column(String, nullable=True)
    annual_ctc = Column(Float, nullable=True)
    fixed_ctc = Column(Float, nullable=True)
    variable_ctc = Column(Float, nullable=True)
    joining_bonus = Column(Float, nullable=True)
    performance_bonus = Column(Float, nullable=True)
    ppo_available = Column(Boolean, default=False)
    ppo_type = Column(String, nullable=True)
    ppo_ctc = Column(Float, nullable=True)
    performance_criteria = Column(String, nullable=True)
    joining_date = Column(Date, nullable=True)
    offer_status = Column(String, nullable=False)
    employment_type = Column(String, nullable=True)
    location = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    drive = relationship("PlacementDrive", back_populates="offer")""",

    "app/models/note.py": """from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("drives.id", ondelete="CASCADE"), unique=True)
    expected_topics = Column(Text, nullable=True)
    company_questions = Column(Text, nullable=True)
    previous_questions = Column(Text, nullable=True)
    technical_topics = Column(Text, nullable=True)
    hr_questions = Column(Text, nullable=True)
    projects_to_discuss = Column(Text, nullable=True)
    resume_points = Column(Text, nullable=True)
    preparation_checklist = Column(Text, nullable=True)
    interview_experience = Column(Text, nullable=True)
    general_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    drive = relationship("PlacementDrive", back_populates="preparation_notes")""",

    "app/schemas/__init__.py": "",
    
    "app/schemas/auth.py": """from pydantic import BaseModel, EmailStr
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    class Config:
        from_attributes = True

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str""",

    "app/schemas/company.py": """from pydantic import BaseModel, ConfigDict
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
    total: int""",

    "app/schemas/drive.py": """from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.drive import DriveTypeEnum, OverallStatusEnum

class DriveBase(BaseModel):
    company_id: int
    job_role: str
    job_location: Optional[str] = None
    drive_type: DriveTypeEnum = DriveTypeEnum.campus
    recruitment_type: Optional[str] = None
    application_date: Optional[datetime] = None
    eligibility_criteria: Optional[str] = None
    cgpa_requirement: Optional[float] = None
    backlogs_allowed: bool = False
    branch_eligibility: Optional[str] = None
    vacancies: Optional[int] = None
    current_stage: Optional[str] = None
    overall_status: OverallStatusEnum = OverallStatusEnum.interested
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
    updated_at: Optional[datetime]
    company_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class DriveDetailResponse(DriveResponse):
    assessments: List[dict] = []
    interviews: List[dict] = []
    offer: Optional[dict] = None
    events: List[dict] = []
    notes_detail: Optional[dict] = None
    
    model_config = ConfigDict(from_attributes=True)""",

    "app/schemas/event.py": """from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, time, datetime
from app.models.event import EventStatusEnum

class EventBase(BaseModel):
    drive_id: int
    event_type: str
    title: str
    date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
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
    date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
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
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)""",

    "app/schemas/assessment.py": """from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, time, datetime

class AssessmentBase(BaseModel):
    drive_id: int
    assessment_name: str
    assessment_type: str
    round_number: Optional[int] = None
    date: Optional[date] = None
    start_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    venue_mode: Optional[str] = None
    venue_name: Optional[str] = None
    platform: Optional[str] = None
    total_questions: Optional[int] = None
    total_marks: Optional[float] = None
    negative_marking: bool = False
    programming_languages: Optional[str] = None
    difficulty: Optional[str] = None
    result_date: Optional[date] = None
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
    date: Optional[date] = None
    start_time: Optional[time] = None
    duration_minutes: Optional[int] = None
    venue_mode: Optional[str] = None
    venue_name: Optional[str] = None
    platform: Optional[str] = None
    total_questions: Optional[int] = None
    total_marks: Optional[float] = None
    negative_marking: Optional[bool] = None
    programming_languages: Optional[str] = None
    difficulty: Optional[str] = None
    result_date: Optional[date] = None
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
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)""",

    "app/schemas/interview.py": """from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, time, datetime

class InterviewBase(BaseModel):
    drive_id: int
    round_number: Optional[int] = None
    interview_type: str
    date: Optional[date] = None
    start_time: Optional[time] = None
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
    date: Optional[date] = None
    start_time: Optional[time] = None
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
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)""",

    "app/schemas/offer.py": """from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime

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
    joining_date: Optional[date] = None
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
    joining_date: Optional[date] = None
    offer_status: Optional[str] = None
    employment_type: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None

class OfferResponse(OfferBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)""",

    "app/schemas/note.py": """from pydantic import BaseModel, ConfigDict
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
    
    model_config = ConfigDict(from_attributes=True)""",

    "app/schemas/analytics.py": """from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional

class DashboardStats(BaseModel):
    total_companies: int
    active_drives: int
    upcoming_tests: int
    upcoming_interviews: int
    shortlisted: int
    rejected: int
    offers_received: int
    highest_ctc: float
    average_ctc: float
    total_applications: int
    model_config = ConfigDict(from_attributes=True)

class ConversionFunnel(BaseModel):
    applications: int
    ppt: int
    assessment: int
    interview: int
    offer: int
    percentages: Dict[str, float]
    model_config = ConfigDict(from_attributes=True)

class AssessmentAnalytics(BaseModel):
    total: int
    by_type: Dict[str, int]
    cleared: int
    failed: int
    success_rate: float
    type_success_rates: Dict[str, float]
    model_config = ConfigDict(from_attributes=True)

class InterviewAnalytics(BaseModel):
    total: int
    by_type: Dict[str, int]
    cleared: int
    failed: int
    success_rate: float
    model_config = ConfigDict(from_attributes=True)

class CompensationAnalytics(BaseModel):
    highest_ctc: float
    average_ctc: float
    lowest_ctc: float
    average_stipend: float
    highest_stipend: float
    company_ctc_list: List[Dict[str, float]]
    model_config = ConfigDict(from_attributes=True)

class PlacementStats(BaseModel):
    dashboard: DashboardStats
    funnel: ConversionFunnel
    assessments: AssessmentAnalytics
    interviews: InterviewAnalytics
    compensation: CompensationAnalytics
    model_config = ConfigDict(from_attributes=True)

class UpcomingEvent(BaseModel):
    company_name: str
    event_type: str
    title: str
    date: str
    time: str
    venue: str
    mode: str
    status: str
    model_config = ConfigDict(from_attributes=True)"""
}

def create_files():
    for filepath, content in files.items():
        full_path = os.path.join(base_dir, filepath)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content.strip())
            
create_files()
print("Base files created!")
