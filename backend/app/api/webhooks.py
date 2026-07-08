import hmac
import hashlib
import logging
from fastapi import APIRouter, Depends, HTTPException, Header, Request, BackgroundTasks
from sqlmodel import Session, select
from app.config import settings
from app.core.database import get_session
from app.models.repo import Repository
from app.models.pr_review import PRReview
from app.tasks.worker import dispatch_review_task

router = APIRouter(prefix="/webhooks", tags=["github_webhooks"])
logger = logging.getLogger(__name__)

async def verify_signature(request: Request, x_hub_signature_256: str = Header(None)):
    """Validate incoming webhook request headers against SHA256 signatures."""
    if not settings.GITHUB_WEBHOOK_SECRET:
        # Bypass validation if secret is not set
        return
        
    if not x_hub_signature_256:
        raise HTTPException(status_code=401, detail="X-Hub-Signature-256 header missing")
        
    body = await request.body()
    # Extract signature bytes from header
    signature = x_hub_signature_256.split("=")[1]
    
    mac = hmac.new(
        settings.GITHUB_WEBHOOK_SECRET.encode("utf-8"),
        msg=body,
        digestmod=hashlib.sha256
    )
    
    if not hmac.compare_digest(mac.hexdigest(), signature):
        raise HTTPException(status_code=401, detail="GitHub signature validation failed")

@router.post("")
async def github_webhook_receiver(
    request: Request,
    background_tasks: BackgroundTasks,
    x_github_event: str = Header(None),
    db: Session = Depends(get_session),
    _ = Depends(verify_signature)
):
    """Intercept GitHub PR webhook events, verify signatures, and trigger background reviews."""
    payload = await request.json()
    
    if x_github_event == "push":
        # Handle push event
        repo_data = payload.get("repository", {})
        head_commit = payload.get("head_commit")
        installation_id = payload.get("installation", {}).get("id")
        
        if not head_commit:
            return {"status": "ignored", "reason": "No head commit found in push event"}
            
        github_repo_id = repo_data.get("id")
        repo = db.exec(select(Repository).where(Repository.github_id == github_repo_id)).first()
        if not repo:
            return {"status": "ignored", "reason": "Repository is not registered with CodeSageAI"}
            
        # Create a commit review
        review = PRReview(
            review_type="commit",
            commit_hash=head_commit.get("id"),
            pr_title=head_commit.get("message", "Commit update").split("\n")[0],
            base_branch="", # Not applicable for commit
            head_branch=payload.get("ref", "").replace("refs/heads/", ""),
            status="pending",
            repository_id=repo.id
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        
        dispatch_review_task(
            review_id=review.id,
            installation_id=installation_id,
            background_tasks=background_tasks
        )
        return {
            "status": "triggered",
            "review_id": review.id,
            "repo": repo.full_name,
            "type": "commit"
        }
    
    elif x_github_event == "pull_request":
        action = payload.get("action")
        if action not in ["opened", "synchronize"]:
            return {"status": "ignored", "reason": f"PR action {action} ignored"}
            
        pr_data = payload.get("pull_request", {})
        repo_data = payload.get("repository", {})
        installation_id = payload.get("installation", {}).get("id")
        
        github_repo_id = repo_data.get("id")
        
        # Query database to check if this repo is registered
        repo = db.exec(select(Repository).where(Repository.github_id == github_repo_id)).first()
        if not repo:
            return {"status": "ignored", "reason": "Repository is not registered with CodeSageAI"}
            
        # Initialize pending PRReview record
        review = PRReview(
            review_type="pr",
            pr_number=pr_data.get("number"),
            pr_title=pr_data.get("title"),
            base_branch=pr_data.get("base", {}).get("ref"),
            head_branch=pr_data.get("head", {}).get("ref"),
            status="pending",
            repository_id=repo.id
        )
        db.add(review)
        db.commit()
        db.refresh(review)
        
        # Dispatch code audit task
        dispatch_review_task(
            review_id=review.id,
            installation_id=installation_id,
            background_tasks=background_tasks
        )
        
        return {
            "status": "triggered",
            "review_id": review.id,
            "repo": repo.full_name,
            "pr": review.pr_number,
            "type": "pr"
        }
        
    return {"status": "ignored", "reason": f"GitHub event {x_github_event} ignored"}
