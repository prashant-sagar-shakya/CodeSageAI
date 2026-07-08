from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.repo import Repository
from app.models.pr_review import PRReview
from app.tasks.worker import dispatch_review_task
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["pull_requests_and_reviews"])

class CreateReviewRequest(BaseModel):
    pr_number: int
    pr_title: str
    base_branch: str
    head_branch: str
    installation_id: Optional[int] = None

@router.post("/repos/{repo_id}/reviews", response_model=PRReview)
def trigger_pr_review(
    repo_id: int, 
    req: CreateReviewRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_session)
):
    """Trigger a new code review run for a PR in the background."""
    repo = db.get(Repository, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    # Check limits
    user_id = repo.owner_id
    from app.models.user import User
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Repository owner not found")
        
    from datetime import datetime
    first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    statement = select(PRReview).join(Repository).where(
        Repository.owner_id == user_id,
        PRReview.created_at >= first_day_of_month
    )
    current_review_count = len(db.exec(statement).all())
    
    REVIEW_LIMITS = {"free": 5, "basic": 50, "pro": 999999}
    user_tier = getattr(user, "subscription_tier", "free")
    if current_review_count >= REVIEW_LIMITS.get(user_tier, 5):
        raise HTTPException(status_code=403, detail=f"Monthly review limit reached for {user_tier} plan. Please upgrade to run more reviews.")
        
    # Write pending review run record
    review = PRReview(
        pr_number=req.pr_number,
        pr_title=req.pr_title,
        base_branch=req.base_branch,
        head_branch=req.head_branch,
        status="pending",
        repository_id=repo_id
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    
    # Dispatch review computation task
    dispatch_review_task(
        review_id=review.id,
        installation_id=req.installation_id,
        background_tasks=background_tasks
    )
    
    return review

@router.get("/reviews/{review_id}")
def get_review_status(review_id: int, db: Session = Depends(get_session)):
    """Fetch status, aggregated scores, and issue logs for a specific review ID."""
    review = db.get(PRReview, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    return {
        "id": review.id,
        "pr_number": review.pr_number,
        "pr_title": review.pr_title,
        "base_branch": review.base_branch,
        "head_branch": review.head_branch,
        "status": review.status,
        "duration": review.duration,
        "scores": {
            "security": review.security_score,
            "performance": review.performance_score,
            "readability": review.readability_score,
            "testing": review.testing_score,
            "documentation": review.documentation_score,
            "maintainability": review.maintainability_score,
            "overall": review.overall_score
        },
        "total_files": review.total_files,
        "total_lines": review.total_lines,
        "created_at": review.created_at,
        "issues": review.issues
    }
