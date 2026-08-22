from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import Optional, List
from app.db.session import get_db
from app.models.drive import PlacementDrive
from app.models.company import Company
from app.schemas.drive import DriveCreate, DriveUpdate, DriveResponse, DriveDetailResponse
from app.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[DriveResponse])
async def list_drives(
    company_id: Optional[int] = None,
    status: Optional[str] = None,
    drive_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all drives"""
    stmt = (
        select(PlacementDrive)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .options(selectinload(PlacementDrive.company))
    )
    if company_id:
        stmt = stmt.where(PlacementDrive.company_id == company_id)
    if status:
        stmt = stmt.where(PlacementDrive.overall_status == status)
    if drive_type:
        stmt = stmt.where(PlacementDrive.drive_type == drive_type)
        
    stmt = stmt.order_by(PlacementDrive.created_at.desc())
    res = await db.execute(stmt)
    drives = res.scalars().unique().all()
    
    for d in drives:
        if d.company:
            d.company_name = d.company.name
            
    return drives

@router.post("", response_model=DriveResponse)
async def create_drive(req: DriveCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create drive"""
    company_stmt = select(Company).where(Company.id == req.company_id, Company.user_id == current_user.id)
    company = (await db.execute(company_stmt)).scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    drive = PlacementDrive(**req.model_dump())
    db.add(drive)
    await db.commit()
    await db.refresh(drive)
    drive.company_name = company.name
    return drive

@router.get("/{id}", response_model=DriveDetailResponse)
async def get_drive(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get drive with all details"""
    stmt = (
        select(PlacementDrive)
        .join(Company)
        .where(PlacementDrive.id == id, Company.user_id == current_user.id)
        .options(
            selectinload(PlacementDrive.company),
            selectinload(PlacementDrive.assessments),
            selectinload(PlacementDrive.interviews),
            selectinload(PlacementDrive.offer),
            selectinload(PlacementDrive.events),
            selectinload(PlacementDrive.preparation_notes)
        )
    )
    
    res = await db.execute(stmt)
    drive = res.scalar_one_or_none()
    
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    drive.company_name = drive.company.name if drive.company else None
    return drive

@router.put("/{id}", response_model=DriveResponse)
async def update_drive(id: int, req: DriveUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update drive"""
    stmt = (
        select(PlacementDrive)
        .join(Company)
        .where(PlacementDrive.id == id, Company.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    drive = res.scalar_one_or_none()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    update_data = req.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(drive, k, v)
        
    await db.commit()
    await db.refresh(drive)
    return drive

@router.delete("/{id}")
async def delete_drive(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete drive"""
    stmt = (
        select(PlacementDrive)
        .join(Company)
        .where(PlacementDrive.id == id, Company.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    drive = res.scalar_one_or_none()
    if not drive:
        raise HTTPException(status_code=404, detail="Drive not found")
        
    await db.delete(drive)
    await db.commit()
    return {"message": "Drive deleted"}
