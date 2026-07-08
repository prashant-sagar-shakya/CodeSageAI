import asyncio
from sqlmodel import Session, select
from app.core.database import engine
from app.models.pr_review import PRReview
from app.services.review_service import review_service

async def main():
    with Session(engine) as db:
        failed = db.exec(select(PRReview).where(PRReview.status == 'failed').order_by(PRReview.id.desc())).first()
        if not failed:
            print("No failed reviews found.")
            return
            
        print(f"Testing PRReview ID: {failed.id}")
        await review_service.process_pr_review(failed.id, None)

if __name__ == "__main__":
    asyncio.run(main())
