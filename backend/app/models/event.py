from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Time, ForeignKey, Enum as SQLEnum
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
    event_type = Column(String, nullable=False)
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

    drive = relationship("PlacementDrive", back_populates="events")
