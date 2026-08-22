from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey
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

    drive = relationship("PlacementDrive", back_populates="offer")
