from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
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
    preparation_notes = relationship("Note", uselist=False, back_populates="drive", cascade="all, delete-orphan")
