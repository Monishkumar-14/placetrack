from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime, time
from app.db.session import get_db
from app.models.company import Company
from app.models.drive import PlacementDrive, DriveTypeEnum, OverallStatusEnum
from app.models.event import Event
from app.models.assessment import Assessment
from app.models.interview import Interview
from app.models.offer import Offer
from app.schemas.placement import PlacementCreate, PlacementResponse
from app.deps import get_current_user
from app.models.user import User

router = APIRouter()

# Map employment_type string to DriveTypeEnum
EMPLOYMENT_MAP = {
    "internship": DriveTypeEnum.internship,
    "fte": DriveTypeEnum.full_time,
    "intern_fte": DriveTypeEnum.internship_ppo,
    "intern_ppo": DriveTypeEnum.internship_ppo,
    "campus": DriveTypeEnum.campus,
    "off_campus": DriveTypeEnum.off_campus,
}

# Map status strings from frontend to DB enum
# Flow: Registered → OA Scheduled → OA Done (PPT+OA complete) → 
#       Shortlisted (interview scheduled) → Interview Done (waiting results) → Selected → Rejected
STATUS_MAP = {
    "registered": OverallStatusEnum.applied,
    "applied": OverallStatusEnum.applied,
    "interested": OverallStatusEnum.interested,
    "oa_scheduled": OverallStatusEnum.assessment_scheduled,
    "oa_done": OverallStatusEnum.assessment_completed,
    "shortlisted": OverallStatusEnum.shortlisted,
    "interview_done": OverallStatusEnum.interview_completed,
    "selected": OverallStatusEnum.offer_accepted,
    "rejected": OverallStatusEnum.rejected,
}


def parse_time(time_str: str | None):
    """Parse 'HH:MM' string to time object."""
    if not time_str:
        return None
    try:
        parts = time_str.split(":")
        return time(int(parts[0]), int(parts[1]))
    except Exception:
        return None


@router.post("", response_model=PlacementResponse)
async def create_placement(
    req: PlacementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a full placement entry from a single form — company, drive, rounds, offer."""

    # 1. Find or create company
    stmt = select(Company).where(
        Company.user_id == current_user.id,
        Company.name.ilike(req.company_name.strip()),
    )
    result = await db.execute(stmt)
    company = result.scalar_one_or_none()

    if not company:
        company = Company(
            user_id=current_user.id,
            name=req.company_name.strip(),
            description=req.company_description,
            priority=req.priority or "medium",
        )
        db.add(company)
        await db.flush()  # get company.id

    # 2. Create drive
    drive_type = EMPLOYMENT_MAP.get(req.employment_type, DriveTypeEnum.campus)
    overall_status = STATUS_MAP.get(req.current_status or "registered", OverallStatusEnum.applied)

    # Build eligibility string
    eligibility_parts = []
    if req.min_cgpa:
        eligibility_parts.append(f"Min CGPA: {req.min_cgpa}")
    if req.min_10th_pct:
        eligibility_parts.append(f"Min 10th: {req.min_10th_pct}%")
    if req.min_12th_pct:
        eligibility_parts.append(f"Min 12th: {req.min_12th_pct}%")
    if req.max_backlogs is not None:
        eligibility_parts.append(f"Max Backlogs: {req.max_backlogs}")

    drive = PlacementDrive(
        company_id=company.id,
        job_role=req.job_role,
        job_location=req.job_location,
        drive_type=drive_type,
        recruitment_type=req.employment_type,
        eligibility_criteria=" | ".join(eligibility_parts) if eligibility_parts else None,
        cgpa_requirement=req.min_cgpa,
        backlogs_allowed=(req.max_backlogs or 0) > 0,
        branch_eligibility=req.eligible_branches,
        overall_status=overall_status,
        notes=req.notes,
    )
    db.add(drive)
    await db.flush()  # get drive.id

    # 3. Create rounds (events, assessments, interviews)
    for rnd in (req.rounds or []):
        t = parse_time(rnd.time)

        if rnd.round_type == "ppt":
            event = Event(
                drive_id=drive.id,
                event_type="ppt",
                title=f"PPT - {req.company_name}",
                date=rnd.date,
                start_time=t,
                venue_mode=rnd.venue_mode,
                venue_name=rnd.venue_name,
                platform=rnd.platform,
                notes=rnd.notes,
            )
            db.add(event)

        elif rnd.round_type == "test":
            assessment = Assessment(
                drive_id=drive.id,
                assessment_name=f"Online Assessment - {req.company_name}",
                assessment_type="coding",
                date=rnd.date,
                start_time=t,
                venue_mode=rnd.venue_mode,
                venue_name=rnd.venue_name,
                platform=rnd.platform,
                notes=rnd.notes,
            )
            db.add(assessment)

        elif rnd.round_type == "interview":
            interview = Interview(
                drive_id=drive.id,
                interview_type="technical",
                round_number=1,
                date=rnd.date,
                start_time=t,
                venue_mode=rnd.venue_mode,
                venue_name=rnd.venue_name,
                notes=rnd.notes,
            )
            db.add(interview)

    # 4. Create offer record (if compensation info provided)
    if req.annual_ctc or req.monthly_stipend:
        offer_type = "internship" if "intern" in (req.employment_type or "") else "full_time"
        offer = Offer(
            drive_id=drive.id,
            offer_type=offer_type,
            annual_ctc=req.annual_ctc,
            monthly_stipend=req.monthly_stipend,
            ppo_available=req.ppo_available or False,
            ppo_ctc=req.ppo_ctc,
            offer_status="pending",
            location=req.job_location,
        )
        db.add(offer)

    await db.commit()

    # Re-fetch with eager loading to avoid lazy-load in async context
    stmt = (
        select(PlacementDrive)
        .where(PlacementDrive.id == drive.id)
        .options(
            selectinload(PlacementDrive.company),
            selectinload(PlacementDrive.events),
            selectinload(PlacementDrive.assessments),
            selectinload(PlacementDrive.interviews),
            selectinload(PlacementDrive.offer),
        )
    )
    result = await db.execute(stmt)
    drive = result.scalar_one()

    # Return enriched response
    return await _build_placement_response(db, drive, drive.company)


@router.get("", response_model=List[PlacementResponse])
async def list_placements(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all placements with enriched data (company + rounds + offer flattened)."""
    stmt = (
        select(PlacementDrive)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .options(
            selectinload(PlacementDrive.company),
            selectinload(PlacementDrive.events),
            selectinload(PlacementDrive.assessments),
            selectinload(PlacementDrive.interviews),
            selectinload(PlacementDrive.offer),
        )
        .order_by(PlacementDrive.created_at.desc())
    )
    result = await db.execute(stmt)
    drives = result.scalars().unique().all()

    placements = []
    for drive in drives:
        placements.append(await _build_placement_response(db, drive, drive.company))
    return placements


@router.get("/{id}", response_model=PlacementResponse)
async def get_placement(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single placement with all enriched data."""
    stmt = (
        select(PlacementDrive)
        .join(Company)
        .where(PlacementDrive.id == id, Company.user_id == current_user.id)
        .options(
            selectinload(PlacementDrive.company),
            selectinload(PlacementDrive.events),
            selectinload(PlacementDrive.assessments),
            selectinload(PlacementDrive.interviews),
            selectinload(PlacementDrive.offer),
        )
    )
    result = await db.execute(stmt)
    drive = result.scalar_one_or_none()
    if not drive:
        raise HTTPException(status_code=404, detail="Placement not found")
    return await _build_placement_response(db, drive, drive.company)


@router.delete("/{id}")
async def delete_placement(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a placement (cascade deletes drive + all rounds + offer)."""
    stmt = (
        select(PlacementDrive)
        .join(Company)
        .where(PlacementDrive.id == id, Company.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    drive = result.scalar_one_or_none()
    if not drive:
        raise HTTPException(status_code=404, detail="Placement not found")
    await db.delete(drive)
    await db.commit()
    return {"message": "Placement deleted"}


@router.patch("/{id}/status", response_model=PlacementResponse)
async def update_placement_status(
    id: int,
    body: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a placement's status, notes, or priority."""
    stmt = (
        select(PlacementDrive)
        .join(Company)
        .where(PlacementDrive.id == id, Company.user_id == current_user.id)
    )
    result = await db.execute(stmt)
    drive = result.scalar_one_or_none()
    if not drive:
        raise HTTPException(status_code=404, detail="Placement not found")

    # Update status
    if "status" in body:
        new_status = STATUS_MAP.get(body["status"])
        if new_status:
            drive.overall_status = new_status

    # Update notes
    if "notes" in body:
        drive.notes = body["notes"]

    # Update priority on company
    if "priority" in body:
        company = await db.get(Company, drive.company_id)
        if company:
            company.priority = body["priority"]

    await db.commit()

    # Re-fetch with eager loading
    stmt = (
        select(PlacementDrive)
        .where(PlacementDrive.id == id)
        .options(
            selectinload(PlacementDrive.company),
            selectinload(PlacementDrive.events),
            selectinload(PlacementDrive.assessments),
            selectinload(PlacementDrive.interviews),
            selectinload(PlacementDrive.offer),
        )
    )
    result = await db.execute(stmt)
    drive = result.scalar_one()
    return await _build_placement_response(db, drive, drive.company)


async def _build_placement_response(db, drive, company) -> PlacementResponse:
    """Build a flattened placement response from drive + related objects."""
    # Find PPT, test, interview from related objects
    ppt_date = ppt_venue = test_date = test_venue = interview_date = interview_mode = None

    for event in (drive.events or []):
        if event.event_type == "ppt":
            ppt_date = f"{event.date}" + (f" {event.start_time}" if event.start_time else "")
            ppt_venue = event.venue_name or event.venue_mode or ""

    for a in (drive.assessments or []):
        if a.date:
            test_date = f"{a.date}" + (f" {a.start_time}" if a.start_time else "")
            test_venue = a.venue_name or a.venue_mode or a.platform or ""

    for i in (drive.interviews or []):
        if i.date:
            interview_date = f"{i.date}" + (f" {i.start_time}" if i.start_time else "")
            interview_mode = i.venue_mode or i.venue_name or ""

    offer = drive.offer
    return PlacementResponse(
        id=drive.id,
        company_id=company.id,
        company_name=company.name,
        job_role=drive.job_role or "",
        job_location=drive.job_location,
        employment_type=drive.recruitment_type,
        description=company.description,
        annual_ctc=offer.annual_ctc if offer else None,
        monthly_stipend=offer.monthly_stipend if offer else None,
        ppo_available=offer.ppo_available if offer else False,
        ppo_ctc=offer.ppo_ctc if offer else None,
        eligible_branches=drive.branch_eligibility,
        min_cgpa=drive.cgpa_requirement,
        min_10th_pct=None,
        min_12th_pct=None,
        max_backlogs=0 if not drive.backlogs_allowed else None,
        reg_start_date=None,
        reg_deadline=None,
        ppt_date=ppt_date,
        ppt_venue=ppt_venue,
        test_date=test_date,
        test_venue=test_venue,
        interview_date=interview_date,
        interview_mode=interview_mode,
        overall_status=drive.overall_status.value if hasattr(drive.overall_status, 'value') else str(drive.overall_status) if drive.overall_status else None,
        priority=company.priority.value if hasattr(company.priority, 'value') else str(company.priority) if company.priority else None,
        notes=drive.notes,
        created_at=drive.created_at,
    )
