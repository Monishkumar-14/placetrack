from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Time, ForeignKey
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
    shortlisted = Column(String, nullable=True)
    score = Column(Float, nullable=True)
    max_score = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True)
    rank = Column(Integer, nullable=True)
    percentile = Column(Float, nullable=True)
    questions_attempted = Column(Integer, nullable=True)
    questions_correct = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    drive = relationship("PlacementDrive", back_populates="assessments")
