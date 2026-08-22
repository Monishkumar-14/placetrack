from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.session import get_db
from app.models.offer import Offer
from app.schemas.offer import OfferCreate, OfferUpdate, OfferResponse
from app.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[OfferResponse])
async def list_offers(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Offer)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("", response_model=OfferResponse)
async def create_offer(req: OfferCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if drive already has an offer
    stmt = select(Offer).where(Offer.drive_id == req.drive_id)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Drive already has an offer recorded")
        
    offer = Offer(**req.model_dump())
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return offer

@router.put("/{id}", response_model=OfferResponse)
async def update_offer(id: int, req: OfferUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Offer).where(Offer.id == id)
    offer = (await db.execute(stmt)).scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    for k, v in req.model_dump(exclude_unset=True).items():
        setattr(offer, k, v)
        
    await db.commit()
    await db.refresh(offer)
    return offer

@router.delete("/{id}")
async def delete_offer(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Offer).where(Offer.id == id)
    offer = (await db.execute(stmt)).scalar_one_or_none()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    await db.delete(offer)
    await db.commit()
    return {"message": "Offer deleted"}
