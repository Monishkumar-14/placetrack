from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from app.db.session import get_db
from app.models.interview import Interview
from app.schemas.interview import InterviewCreate, InterviewUpdate, InterviewResponse
from app.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[InterviewResponse])
async def list_interviews(
    interview_type: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Interview)
    if interview_type:
        stmt = stmt.where(Interview.interview_type == interview_type)
    if status:
        stmt = stmt.where(Interview.status == status)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=InterviewResponse)
async def create_interview(req: InterviewCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    interview = Interview(**req.model_dump())
    db.add(interview)
    await db.commit()
    await db.refresh(interview)
    return interview

@router.put("/{id}", response_model=InterviewResponse)
async def update_interview(id: int, req: InterviewUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Interview).where(Interview.id == id)
    interview = (await db.execute(stmt)).scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    for k, v in req.model_dump(exclude_unset=True).items():
        setattr(interview, k, v)
        
    await db.commit()
    await db.refresh(interview)
    return interview

@router.delete("/{id}")
async def delete_interview(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Interview).where(Interview.id == id)
    interview = (await db.execute(stmt)).scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    await db.delete(interview)
    await db.commit()
    return {"message": "Interview deleted"}
