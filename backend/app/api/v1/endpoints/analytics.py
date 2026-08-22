from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, and_, or_, cast, Date
from datetime import datetime, timedelta, date
from app.db.session import get_db
from app.models.company import Company
from app.models.drive import PlacementDrive, OverallStatusEnum
from app.models.event import Event
from app.models.assessment import Assessment
from app.models.interview import Interview
from app.models.offer import Offer
from app.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get dashboard KPI statistics"""
    companies_count = (await db.execute(select(func.count(Company.id)).where(Company.user_id == current_user.id))).scalar() or 0

    active_statuses = [
        OverallStatusEnum.applied, OverallStatusEnum.ppt_scheduled,
        OverallStatusEnum.assessment_scheduled, OverallStatusEnum.assessment_completed,
        OverallStatusEnum.shortlisted, OverallStatusEnum.interview_scheduled,
        OverallStatusEnum.interview_completed
    ]

    active_drives = (await db.execute(
        select(func.count(PlacementDrive.id))
        .join(Company)
        .where(Company.user_id == current_user.id, PlacementDrive.overall_status.in_(active_statuses))
    )).scalar() or 0

    today = date.today()
    next_week = today + timedelta(days=7)

    upcoming_tests = (await db.execute(
        select(func.count(Assessment.id))
        .join(PlacementDrive)
        .join(Company)
        .where(Company.user_id == current_user.id, Assessment.date >= today, Assessment.date <= next_week)
    )).scalar() or 0

    upcoming_interviews = (await db.execute(
        select(func.count(Interview.id))
        .join(PlacementDrive)
        .join(Company)
        .where(Company.user_id == current_user.id, Interview.date >= today, Interview.date <= next_week)
    )).scalar() or 0

    shortlisted_drives = (await db.execute(
        select(func.count(PlacementDrive.id))
        .join(Company)
        .where(Company.user_id == current_user.id, PlacementDrive.overall_status == OverallStatusEnum.shortlisted)
    )).scalar() or 0

    rejected_drives = (await db.execute(
        select(func.count(PlacementDrive.id))
        .join(Company)
        .where(Company.user_id == current_user.id, PlacementDrive.overall_status == OverallStatusEnum.rejected)
    )).scalar() or 0

    offers_result = (await db.execute(
        select(Offer.annual_ctc, Offer.ppo_ctc)
        .join(PlacementDrive)
        .join(Company)
        .where(Company.user_id == current_user.id)
    )).all()

    ctc_values = [r.annual_ctc or r.ppo_ctc or 0 for r in offers_result if (r.annual_ctc or r.ppo_ctc)]
    avg_ctc = sum(ctc_values) / len(ctc_values) if ctc_values else None
    max_ctc = max(ctc_values) if ctc_values else None

    total_applications = (await db.execute(
        select(func.count(PlacementDrive.id))
        .join(Company)
        .where(Company.user_id == current_user.id)
    )).scalar() or 0

    return {
        "total_companies": companies_count,
        "active_drives": active_drives,
        "upcoming_tests": upcoming_tests,
        "upcoming_interviews": upcoming_interviews,
        "shortlisted": shortlisted_drives,
        "rejected": rejected_drives,
        "offers_received": len(offers_result),
        "highest_ctc": max_ctc,
        "average_ctc": round(avg_ctc, 2) if avg_ctc else None,
        "total_applications": total_applications
    }


@router.get("/funnel")
async def get_funnel(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get conversion funnel data"""
    total = (await db.execute(
        select(func.count(PlacementDrive.id)).join(Company).where(Company.user_id == current_user.id)
    )).scalar() or 0

    # PPT attended: drives that have passed PPT stage
    ppt_stages = [
        OverallStatusEnum.assessment_scheduled, OverallStatusEnum.assessment_completed,
        OverallStatusEnum.shortlisted, OverallStatusEnum.interview_scheduled,
        OverallStatusEnum.interview_completed, OverallStatusEnum.offer_received,
        OverallStatusEnum.offer_accepted, OverallStatusEnum.completed
    ]
    ppt = (await db.execute(
        select(func.count(PlacementDrive.id)).join(Company)
        .where(Company.user_id == current_user.id, PlacementDrive.overall_status.in_(ppt_stages))
    )).scalar() or 0

    assessment_stages = [
        OverallStatusEnum.shortlisted, OverallStatusEnum.interview_scheduled,
        OverallStatusEnum.interview_completed, OverallStatusEnum.offer_received,
        OverallStatusEnum.offer_accepted, OverallStatusEnum.completed
    ]
    assessment = (await db.execute(
        select(func.count(PlacementDrive.id)).join(Company)
        .where(Company.user_id == current_user.id, PlacementDrive.overall_status.in_(assessment_stages))
    )).scalar() or 0

    interview_stages = [
        OverallStatusEnum.interview_completed, OverallStatusEnum.offer_received,
        OverallStatusEnum.offer_accepted, OverallStatusEnum.completed
    ]
    interview = (await db.execute(
        select(func.count(PlacementDrive.id)).join(Company)
        .where(Company.user_id == current_user.id, PlacementDrive.overall_status.in_(interview_stages))
    )).scalar() or 0

    offer_stages = [OverallStatusEnum.offer_received, OverallStatusEnum.offer_accepted, OverallStatusEnum.completed]
    offer = (await db.execute(
        select(func.count(PlacementDrive.id)).join(Company)
        .where(Company.user_id == current_user.id, PlacementDrive.overall_status.in_(offer_stages))
    )).scalar() or 0

    return {
        "applications": total,
        "ppt": ppt,
        "assessment": assessment,
        "interview": interview,
        "offer": offer,
        "ppt_pct": round((ppt / total) * 100, 1) if total > 0 else 0,
        "assessment_pct": round((assessment / total) * 100, 1) if total > 0 else 0,
        "interview_pct": round((interview / total) * 100, 1) if total > 0 else 0,
        "offer_pct": round((offer / total) * 100, 1) if total > 0 else 0,
    }


@router.get("/assessments")
async def get_assessments_analytics(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get assessment analytics"""
    base_query = select(Assessment).join(PlacementDrive).join(Company).where(Company.user_id == current_user.id)
    result = await db.execute(base_query)
    assessments = result.scalars().all()

    total = len(assessments)
    cleared = sum(1 for a in assessments if a.shortlisted == 'yes')
    failed = sum(1 for a in assessments if a.shortlisted == 'no')
    pending = sum(1 for a in assessments if a.shortlisted == 'pending' or a.shortlisted is None)

    # Group by type
    type_map: dict[str, dict[str, int]] = {}
    for a in assessments:
        t = a.assessment_type or 'other'
        if t not in type_map:
            type_map[t] = {'total': 0, 'cleared': 0}
        type_map[t]['total'] += 1
        if a.shortlisted == 'yes':
            type_map[t]['cleared'] += 1

    type_breakdown = [
        {"type": t, "total": v['total'], "cleared": v['cleared'],
         "rate": round((v['cleared'] / v['total']) * 100, 1) if v['total'] > 0 else 0}
        for t, v in type_map.items()
    ]

    return {
        "total": total,
        "cleared": cleared,
        "failed": failed,
        "pending": pending,
        "success_rate": round((cleared / total) * 100, 1) if total > 0 else 0,
        "type_breakdown": type_breakdown
    }


@router.get("/interviews")
async def get_interviews_analytics(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get interview analytics"""
    base_query = select(Interview).join(PlacementDrive).join(Company).where(Company.user_id == current_user.id)
    result = await db.execute(base_query)
    interviews = result.scalars().all()

    total = len(interviews)
    cleared = sum(1 for i in interviews if i.shortlisted == 'yes')
    failed = sum(1 for i in interviews if i.shortlisted == 'no')
    pending = sum(1 for i in interviews if i.shortlisted == 'pending' or i.shortlisted is None)

    type_map: dict[str, dict[str, int]] = {}
    for i in interviews:
        t = i.interview_type or 'other'
        if t not in type_map:
            type_map[t] = {'total': 0, 'cleared': 0}
        type_map[t]['total'] += 1
        if i.shortlisted == 'yes':
            type_map[t]['cleared'] += 1

    type_breakdown = [
        {"type": t, "total": v['total'], "cleared": v['cleared'],
         "rate": round((v['cleared'] / v['total']) * 100, 1) if v['total'] > 0 else 0}
        for t, v in type_map.items()
    ]

    return {
        "total": total,
        "cleared": cleared,
        "failed": failed,
        "pending": pending,
        "success_rate": round((cleared / total) * 100, 1) if total > 0 else 0,
        "type_breakdown": type_breakdown
    }


@router.get("/compensation")
async def get_compensation_analytics(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get compensation analytics"""
    result = await db.execute(
        select(Offer, Company.name.label("company_name"))
        .join(PlacementDrive, Offer.drive_id == PlacementDrive.id)
        .join(Company, PlacementDrive.company_id == Company.id)
        .where(Company.user_id == current_user.id)
    )
    rows = result.all()

    ctc_values = []
    stipend_values = []
    company_list = []

    for offer, company_name in rows:
        ctc = offer.annual_ctc or offer.ppo_ctc or 0
        if ctc > 0:
            ctc_values.append(ctc)
        if offer.monthly_stipend:
            stipend_values.append(offer.monthly_stipend)
        company_list.append({
            "company_name": company_name,
            "ctc": ctc,
            "stipend": offer.monthly_stipend
        })

    # Sort by CTC descending
    company_list.sort(key=lambda x: x['ctc'], reverse=True)

    return {
        "highest_ctc": max(ctc_values) if ctc_values else None,
        "average_ctc": round(sum(ctc_values) / len(ctc_values), 2) if ctc_values else None,
        "lowest_ctc": min(ctc_values) if ctc_values else None,
        "average_stipend": round(sum(stipend_values) / len(stipend_values), 2) if stipend_values else None,
        "highest_stipend": max(stipend_values) if stipend_values else None,
        "company_ctc_list": company_list
    }


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get overall placement statistics"""
    total = (await db.execute(
        select(func.count(PlacementDrive.id)).join(Company).where(Company.user_id == current_user.id)
    )).scalar() or 0

    # Assessments attempted
    oa_attempted = (await db.execute(
        select(func.count(Assessment.id))
        .join(PlacementDrive).join(Company)
        .where(Company.user_id == current_user.id)
    )).scalar() or 0

    oa_cleared = (await db.execute(
        select(func.count(Assessment.id))
        .join(PlacementDrive).join(Company)
        .where(Company.user_id == current_user.id, Assessment.shortlisted == 'yes')
    )).scalar() or 0

    interviews_attended = (await db.execute(
        select(func.count(Interview.id))
        .join(PlacementDrive).join(Company)
        .where(Company.user_id == current_user.id, Interview.status.in_(['completed', 'shortlisted', 'rejected']))
    )).scalar() or 0

    offers = (await db.execute(
        select(func.count(Offer.id))
        .join(PlacementDrive).join(Company)
        .where(Company.user_id == current_user.id)
    )).scalar() or 0

    funnel = await get_funnel(db, current_user)

    return {
        "companies_applied": total,
        "ppt_attended": funnel["ppt"],
        "oa_attempted": oa_attempted,
        "oa_cleared": oa_cleared,
        "interviews_attended": interviews_attended,
        "final_offers": offers,
        "overall_success_rate": round((offers / total) * 100, 1) if total > 0 else 0,
        "interview_conversion": round((offers / interviews_attended) * 100, 1) if interviews_attended > 0 else 0,
    }


@router.get("/conflicts")
async def get_conflicts(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Detect scheduling conflicts between events on the same date"""
    today = date.today()
    future_events = (await db.execute(
        select(Event, Company.name.label("company_name"), PlacementDrive.job_role.label("drive_job_role"))
        .join(PlacementDrive, Event.drive_id == PlacementDrive.id)
        .join(Company, PlacementDrive.company_id == Company.id)
        .where(Company.user_id == current_user.id, Event.date >= today, Event.status == 'upcoming')
        .order_by(Event.date, Event.start_time)
    )).all()

    conflicts = []
    # Group by date
    date_groups: dict[str, list] = {}
    for event, company_name, role in future_events:
        d = str(event.date)
        if d not in date_groups:
            date_groups[d] = []
        date_groups[d].append({
            "id": event.id,
            "company_name": company_name,
            "event_type": event.event_type,
            "title": event.title,
            "date": d,
            "start_time": str(event.start_time) if event.start_time else None,
            "venue_name": event.venue_name,
            "venue_mode": event.venue_mode,
            "status": event.status,
            "drive_id": event.drive_id,
        })

    for d, events in date_groups.items():
        if len(events) >= 2:
            for i in range(len(events)):
                for j in range(i + 1, len(events)):
                    e1 = events[i]
                    e2 = events[j]
                    if e1["start_time"] and e2["start_time"]:
                        conflicts.append({
                            "event1": e1,
                            "event2": e2,
                            "overlap_start": e1["start_time"],
                            "overlap_end": e2["start_time"]
                        })
                    else:
                        conflicts.append({
                            "event1": e1,
                            "event2": e2,
                            "overlap_start": d,
                            "overlap_end": d
                        })

    return conflicts
