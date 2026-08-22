from pydantic import BaseModel, ConfigDict
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
    model_config = ConfigDict(from_attributes=True)
