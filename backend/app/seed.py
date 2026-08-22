import asyncio
from datetime import date, time, timedelta, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import init_db, async_session
from app.models.user import User
from app.models.company import Company, PriorityEnum
from app.models.drive import PlacementDrive, DriveTypeEnum, OverallStatusEnum
from app.models.event import Event, EventStatusEnum
from app.models.assessment import Assessment
from app.models.interview import Interview
from app.models.offer import Offer
from app.models.note import Note
from app.core.security import get_password_hash

async def seed_data():
    await init_db()
    
    async with async_session() as db:
        # Create Admin
        stmt = select(User).where(User.email == "admin@placement.dev")
        user = (await db.execute(stmt)).scalar_one_or_none()
        if not user:
            user = User(
                name="Placement Admin",
                email="admin@placement.dev",
                password_hash=get_password_hash("password123")
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        companies_data = [
            ("AstraZeneca", "IT", PriorityEnum.high),
            ("Microsoft", "Tech", PriorityEnum.high),
            ("TCS", "IT Services", PriorityEnum.medium),
            ("Cognizant", "IT Services", PriorityEnum.medium),
            ("Accenture", "Consulting", PriorityEnum.medium),
            ("Deloitte", "Consulting", PriorityEnum.high),
            ("Zoho", "Tech", PriorityEnum.medium),
            ("Freshworks", "Tech", PriorityEnum.high),
            ("Wipro", "IT Services", PriorityEnum.low),
            ("Infosys", "IT Services", PriorityEnum.low),
        ]

        # Get existing companies
        exist_comp = (await db.execute(select(Company))).scalars().all()
        if len(exist_comp) > 0:
            print("Database already seeded.")
            return

        for name, industry, priority in companies_data:
            company = Company(
                user_id=user.id,
                name=name,
                industry=industry,
                priority=priority
            )
            db.add(company)
            await db.commit()
            await db.refresh(company)

            # 1 Drive per company
            drive = PlacementDrive(
                company_id=company.id,
                job_role="Software Engineer",
                drive_type=DriveTypeEnum.campus,
                overall_status=OverallStatusEnum.interview_scheduled,
                application_date=datetime(2026, 8, 15),
                eligibility_criteria="7.5 CGPA, No standing arrears"
            )
            db.add(drive)
            await db.commit()
            await db.refresh(drive)

            # Add Events
            event = Event(
                drive_id=drive.id,
                event_type="ppt",
                title=f"{name} PPT",
                date=date(2026, 8, 20),
                start_time=time(10, 0),
                venue_mode="college_campus",
                status=EventStatusEnum.completed
            )
            db.add(event)

            # Add Assessment
            assessment = Assessment(
                drive_id=drive.id,
                assessment_name="Coding Round",
                assessment_type="coding",
                date=date(2026, 8, 22),
                score=85,
                max_score=100,
                percentage=85.0
            )
            db.add(assessment)
            
            # Add Interview
            interview = Interview(
                drive_id=drive.id,
                interview_type="technical",
                date=date(2026, 8, 25),
                status="scheduled"
            )
            db.add(interview)

            # Add Offer for High Priority
            if priority == PriorityEnum.high:
                drive.overall_status = OverallStatusEnum.offer_received
                offer = Offer(
                    drive_id=drive.id,
                    offer_type="full_time",
                    annual_ctc=1500000 + (len(name) * 100000),
                    offer_status="offer_accepted"
                )
                db.add(offer)

            await db.commit()

        print("Seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
