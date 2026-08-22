from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
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

    drive = relationship("PlacementDrive", back_populates="preparation_notes")
