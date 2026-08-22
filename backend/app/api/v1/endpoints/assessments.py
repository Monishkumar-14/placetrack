from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional, List
from app.db.session import get_db
from app.models.assessment import Assessment
from app.schemas.assessment import AssessmentCreate, AssessmentUpdate, AssessmentResponse
from app.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[AssessmentResponse])
async def list_assessments(
    assessment_type: Optional[str] = None,
    result: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Assessment)
    if assessment_type:
        stmt = stmt.where(Assessment.assessment_type == assessment_type)
    if result:
        stmt = stmt.where(Assessment.result == result)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=AssessmentResponse)
async def create_assessment(req: AssessmentCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = req.model_dump()
    if data.get('score') is not None and data.get('max_score') is not None and data.get('max_score') > 0:
        data['percentage'] = (data['score'] / data['max_score']) * 100
    assessment = Assessment(**data)
    db.add(assessment)
    await db.commit()
    await db.refresh(assessment)
    return assessment

@router.put("/{id}", response_model=AssessmentResponse)
async def update_assessment(id: int, req: AssessmentUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Assessment).where(Assessment.id == id)
    assessment = (await db.execute(stmt)).scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    update_data = req.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(assessment, k, v)
        
    if assessment.score is not None and assessment.max_score is not None and assessment.max_score > 0:
        assessment.percentage = (assessment.score / assessment.max_score) * 100
        
    await db.commit()
    await db.refresh(assessment)
    return assessment

@router.delete("/{id}")
async def delete_assessment(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Assessment).where(Assessment.id == id)
    assessment = (await db.execute(stmt)).scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    await db.delete(assessment)
    await db.commit()
    return {"message": "Assessment deleted"}
