from sqlalchemy import Column, Integer, String, DateTime, Date, Time, ForeignKey, Text
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

    drive = relationship("PlacementDrive", back_populates="interviews")
