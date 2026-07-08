import asyncio
from sqlmodel import Session, select
from app.core.database import engine
from app.models.pr_review import PRReview
from app.services.review_service import review_service

async def main():
    with Session(engine) as db:
        # Get the latest failed review
        review = db.exec(select(PRReview).where(PRReview.status == "failed").order_by(PRReview.id.desc())).first()
        if not review:
            print("No failed reviews found. Getting latest pending.")
            review = db.exec(select(PRReview).order_by(PRReview.id.desc())).first()
            if not review:
                print("No reviews at all.")
                return
        
        print(f"Testing process for review ID: {review.id}")
        await review_service.process_pr_review(review.id, None)
        
        # Check if it succeeded
        db.refresh(review)
        print(f"Resulting status: {review.status}")

if __name__ == "__main__":
    asyncio.run(main())
