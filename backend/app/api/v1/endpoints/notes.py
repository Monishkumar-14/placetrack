from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.session import get_db
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[NoteResponse])
async def list_notes(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Note)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/drive/{drive_id}", response_model=NoteResponse)
async def get_note_by_drive(drive_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Note).where(Note.drive_id == drive_id)
    note = (await db.execute(stmt)).scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.post("", response_model=NoteResponse)
async def create_note(req: NoteCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Note).where(Note.drive_id == req.drive_id)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    
    if existing:
        for k, v in req.model_dump(exclude_unset=True).items():
            setattr(existing, k, v)
        await db.commit()
        await db.refresh(existing)
        return existing
        
    note = Note(**req.model_dump())
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note

@router.put("/{id}", response_model=NoteResponse)
async def update_note(id: int, req: NoteUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Note).where(Note.id == id)
    note = (await db.execute(stmt)).scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    for k, v in req.model_dump(exclude_unset=True).items():
        setattr(note, k, v)
        
    await db.commit()
    await db.refresh(note)
    return note

@router.delete("/{id}")
async def delete_note(id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    stmt = select(Note).where(Note.id == id)
    note = (await db.execute(stmt)).scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(note)
    await db.commit()
    return {"message": "Note deleted"}
