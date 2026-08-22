from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from typing import Optional, List
from app.db.session import get_db
from app.models.company import Company
from app.models.drive import PlacementDrive
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from app.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[CompanyResponse])
async def list_companies(
    q: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    archived: Optional[bool] = None,
    sort: Optional[str] = "name",
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List companies with search, filter, sort, pagination"""
    stmt = select(Company).where(Company.user_id == current_user.id)
    if q:
        stmt = stmt.where(Company.name.ilike(f"%{q}%"))
    if priority:
        stmt = stmt.where(Company.priority == priority)
    if archived is not None:
        stmt = stmt.where(Company.archived == archived)
    else:
        stmt = stmt.where(Company.archived == False)
        
    if sort == "name":
        stmt = stmt.order_by(Company.name)
    elif sort == "-name":
        stmt = stmt.order_by(Company.name.desc())
    elif sort == "created_at":
        stmt = stmt.order_by(Company.created_at)
    elif sort == "-created_at":
        stmt = stmt.order_by(Company.created_at.desc())
    else:
        stmt = stmt.order_by(Company.name)
        
    stmt = stmt.offset(skip).limit(limit)
    stmt = stmt.options(selectinload(Company.drives))
    result = await db.execute(stmt)
    companies = result.scalars().unique().all()
    
    # Enrich with drives count
    response = []
    for company in companies:
        resp = CompanyResponse.model_validate(company)
        resp.drives_count = len(company.drives) if company.drives else 0
        resp.active_drives_count = sum(
            1 for d in (company.drives or [])
            if d.overall_status not in ('completed', 'rejected', 'withdrawn')
        )
        response.append(resp)
    
    return response

@router.post("", response_model=CompanyResponse)
async def create_company(req: CompanyCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new company"""
    company = Company(**req.model_dump(), user_id=current_user.id)
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company

@router.get("/{id}", response_model=CompanyResponse)
async def get_company(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get company details"""
    stmt = select(Company).where(Company.id == id, Company.user_id == current_user.id).options(selectinload(Company.drives))
    res = await db.execute(stmt)
    company = res.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    resp = CompanyResponse.model_validate(company)
    resp.drives_count = len(company.drives) if company.drives else 0
    resp.active_drives_count = sum(
        1 for d in (company.drives or [])
        if d.overall_status not in ('completed', 'rejected', 'withdrawn')
    )
    return resp

@router.put("/{id}", response_model=CompanyResponse)
async def update_company(id: int, req: CompanyUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update company details"""
    stmt = select(Company).where(Company.id == id, Company.user_id == current_user.id)
    res = await db.execute(stmt)
    company = res.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(company, key, value)
        
    await db.commit()
    await db.refresh(company)
    return company

@router.delete("/{id}")
async def delete_company(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete company (cascade)"""
    stmt = select(Company).where(Company.id == id, Company.user_id == current_user.id)
    res = await db.execute(stmt)
    company = res.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    await db.delete(company)
    await db.commit()
    return {"message": "Company deleted"}

@router.patch("/{id}/archive", response_model=CompanyResponse)
async def archive_company(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Toggle archive status"""
    stmt = select(Company).where(Company.id == id, Company.user_id == current_user.id)
    res = await db.execute(stmt)
    company = res.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    company.archived = not company.archived
    await db.commit()
    await db.refresh(company)
    return company
