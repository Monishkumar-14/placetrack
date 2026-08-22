from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
import datetime as dt


class RoundInfo(BaseModel):
    """A single round (Test/Interview/PPT) from the college portal."""
    round_type: str  # "test", "interview", "ppt"
    date: Optional[dt.date] = None
    time: Optional[str] = None  # "17:00" format string
    venue_mode: Optional[str] = None  # "online", "offline"
    venue_name: Optional[str] = None
    platform: Optional[str] = None  # e.g. HackerRank, Zoom
    notes: Optional[str] = None


class PlacementCreate(BaseModel):
    """Unified payload — everything from one college portal posting."""
    # Company
    company_name: str
    company_description: Optional[str] = None

    # Role & Drive
    job_role: str
    job_location: Optional[str] = None
    employment_type: str  # "internship", "fte", "intern_fte", "intern_ppo"
    description: Optional[str] = None

    # Compensation
    annual_ctc: Optional[float] = None
    monthly_stipend: Optional[float] = None
    ppo_available: Optional[bool] = False
    ppo_ctc: Optional[float] = None

    # Eligibility
    eligible_branches: Optional[str] = None  # comma-separated
    min_cgpa: Optional[float] = None
    min_10th_pct: Optional[float] = None
    min_12th_pct: Optional[float] = None
    max_backlogs: Optional[int] = None
    academic_year: Optional[str] = None

    # Dates
    reg_start_date: Optional[dt.date] = None
    reg_deadline: Optional[dt.date] = None

    # Rounds
    rounds: Optional[List[RoundInfo]] = []

    # Status & notes
    current_status: Optional[str] = "registered"
    notes: Optional[str] = None
    priority: Optional[str] = "medium"


class PlacementResponse(BaseModel):
    """Full placement card returned from GET."""
    id: int  # drive id
    company_id: int
    company_name: str

    job_role: str
    job_location: Optional[str] = None
    employment_type: Optional[str] = None
    description: Optional[str] = None

    # Compensation
    annual_ctc: Optional[float] = None
    monthly_stipend: Optional[float] = None
    ppo_available: Optional[bool] = False
    ppo_ctc: Optional[float] = None

    # Eligibility
    eligible_branches: Optional[str] = None
    min_cgpa: Optional[float] = None
    min_10th_pct: Optional[float] = None
    min_12th_pct: Optional[float] = None
    max_backlogs: Optional[int] = None

    # Dates
    reg_start_date: Optional[str] = None
    reg_deadline: Optional[str] = None

    # Rounds (flattened for display)
    ppt_date: Optional[str] = None
    ppt_venue: Optional[str] = None
    test_date: Optional[str] = None
    test_venue: Optional[str] = None
    interview_date: Optional[str] = None
    interview_mode: Optional[str] = None

    # Status
    overall_status: Optional[str] = None
    priority: Optional[str] = None
    notes: Optional[str] = None

    created_at: dt.datetime

    model_config = ConfigDict(from_attributes=True)
