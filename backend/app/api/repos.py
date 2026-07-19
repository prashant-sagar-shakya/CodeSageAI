from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.repo import Repository
from app.models.user import User
from app.models.pr_review import PRReview
from app.models.issue import ReviewIssue
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/repos", tags=["repositories"])

class RegisterRepoRequest(BaseModel):
    github_id: int
    name: str
    full_name: str
    description: Optional[str] = None
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    open_issues: int = 0
    is_private: bool = False
    tech_stack: str = ""
    owner_id: int # User DB primary key

@router.get("", response_model=List[Repository])
def get_repos(owner_id: Optional[int] = None, db: Session = Depends(get_session)):
    """List tracked repositories, optionally filtered by owner ID."""
    if owner_id:
        statement = select(Repository).where(Repository.owner_id == owner_id)
    else:
        statement = select(Repository)
    return db.exec(statement).all()

@router.post("", response_model=Repository)
def register_repo(req: RegisterRepoRequest, db: Session = Depends(get_session)):
    """Track a new repository under a registered User's account."""
    user = db.get(User, req.owner_id)
    if not user:
        raise HTTPException(status_code=404, detail="User record not found")
        
    # Prevent duplicate tracking registration
    statement = select(Repository).where(Repository.github_id == req.github_id)
    repo = db.exec(statement).first()
    if repo:
        return repo
        
    repo = Repository(
        github_id=req.github_id,
        name=req.name,
        full_name=req.full_name,
        description=req.description,
        language=req.language,
        stars=req.stars,
        forks=req.forks,
        open_issues=req.open_issues,
        is_private=req.is_private,
        tech_stack=req.tech_stack,
        owner_id=req.owner_id
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return repo
@router.post("/sync", response_model=List[Repository])
async def sync_repos(owner_id: int, db: Session = Depends(get_session)):
    """Auto-import all repositories the user has installed the GitHub App on."""
    user = db.get(User, owner_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    from app.services.github_service import github_service
    github_repos = await github_service.get_user_installation_repos(user.github_id)
    
    if not github_repos:
        # Return existing repos if none found in github app
        statement = select(Repository).where(Repository.owner_id == user.id)
        return db.exec(statement).all()
        
    # Get current repo count
    current_repo_count = len(db.exec(select(Repository).where(Repository.owner_id == user.id)).all())
    
    # Tier limits
    REPO_LIMITS = {"free": 2, "basic": 10, "pro": 999999}
    user_tier = getattr(user, "subscription_tier", "free")
    max_repos = REPO_LIMITS.get(user_tier, 2)
    
    synced_repos = []
    for gh_repo in github_repos:
        # Check if already exists
        statement = select(Repository).where(Repository.github_id == gh_repo.get("id"))
        repo = db.exec(statement).first()
        
        if not repo:
            if current_repo_count >= max_repos:
                continue # Skip adding if limit reached
                
            repo = Repository(
                github_id=gh_repo.get("id"),
                name=gh_repo.get("name"),
                full_name=gh_repo.get("full_name"),
                description=gh_repo.get("description"),
                language=gh_repo.get("language"),
                stars=gh_repo.get("stargazers_count", 0),
                forks=gh_repo.get("forks_count", 0),
                open_issues=gh_repo.get("open_issues_count", 0),
                is_private=gh_repo.get("private", False),
                owner_id=user.id
            )
            db.add(repo)
            synced_repos.append(repo)
            current_repo_count += 1
            
    if synced_repos:
        db.commit()
        
    # Return all repos for this user
    statement = select(Repository).where(Repository.owner_id == user.id)
    return db.exec(statement).all()

@router.post("/import", response_model=Repository)
async def import_repo(
    repo_full_name: str, 
    owner_id: int, 
    db: Session = Depends(get_session)
):
    """Import a repository directly from GitHub and register it in the database."""
    from app.services.github_service import github_service
    
    # 1. Resolve installation ID
    installation_id = await github_service.get_repo_installation_id(repo_full_name)
    if not installation_id:
        raise HTTPException(
            status_code=400, 
            detail=f"Could not find an active installation of this GitHub App for repository '{repo_full_name}'. "
                   f"Please verify that the app is installed and has repository access permissions."
        )
        
    # 2. Fetch token
    token = await github_service.get_installation_token(installation_id)
    if not token:
         raise HTTPException(status_code=401, detail="Could not retrieve GitHub App access token.")
    
    # 3. Get details from GitHub
    try:
        details = await github_service.get_repo_details(repo_full_name, token)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch repository details: {str(e)}")
        
    # 4. Verify User exists
    user = db.get(User, owner_id)
    if not user:
        raise HTTPException(status_code=404, detail="User record not found")
        
    # 5. Prevent duplicate tracking
    github_id = details.get("id")
    statement = select(Repository).where(Repository.github_id == github_id)
    repo = db.exec(statement).first()
    if repo:
        return repo
        
    # Check limits
    current_repo_count = len(user.repositories)
    REPO_LIMITS = {"free": 2, "basic": 10, "pro": 999999}
    user_tier = getattr(user, "subscription_tier", "free")
    if current_repo_count >= REPO_LIMITS.get(user_tier, 2):
        raise HTTPException(status_code=403, detail=f"Repository limit reached for {user_tier} plan. Please upgrade to track more.")
        
    # 6. Register in database
    repo = Repository(
        github_id=github_id,
        name=details.get("name"),
        full_name=details.get("full_name"),
        description=details.get("description"),
        language=details.get("language"),
        stars=details.get("stargazers_count", 0),
        forks=details.get("forks_count", 0),
        open_issues=details.get("open_issues_count", 0),
        is_private=details.get("private", False),
        tech_stack=details.get("language", "") if details.get("language") else "Unknown",
        owner_id=owner_id
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return repo

@router.get("/dashboard/stats")
def get_dashboard_stats(owner_id: int, repo_id: Optional[int] = None, db: Session = Depends(get_session)):
    """Fetch real calculated metrics and history for the dashboard."""
    # 1. Get user's repository IDs
    if repo_id:
        repo_statement = select(Repository.id).where(Repository.owner_id == owner_id).where(Repository.id == repo_id)
    else:
        repo_statement = select(Repository.id).where(Repository.owner_id == owner_id)
        
    repo_ids = db.exec(repo_statement).all()
    
    if not repo_ids:
        # Return empty stats if user has no repositories
        return {
            "totalReviews": 0,
            "bugsFound": 0,
            "securityIssues": 0,
            "avgScore": 0,
            "reviewsTrend": 0,
            "bugsTrend": 0,
            "securityTrend": 0,
            "scoreTrend": 0,
            "scores": {
                "security": 0,
                "performance": 0,
                "readability": 0,
                "testing": 0,
                "documentation": 0,
                "maintainability": 0
            },
            "recentActivity": [],
            "reviewHistory": [],
            "commonIssues": []
        }
        
    # 2. Get reviews
    review_statement = select(PRReview).where(PRReview.repository_id.in_(repo_ids))
    reviews = db.exec(review_statement).all()
    completed_reviews = [r for r in reviews if r.status == "completed"]
    
    # 3. Get issues
    review_ids = [r.id for r in reviews]
    issues = []
    if review_ids:
        issues_statement = select(ReviewIssue).where(ReviewIssue.review_id.in_(review_ids))
        issues = db.exec(issues_statement).all()
    
    bugs_count = sum(1 for iss in issues if "bug" in (iss.agent or "").lower() or "bug" in (iss.category or "").lower())
    security_count = sum(1 for iss in issues if "security" in (iss.agent or "").lower() or "security" in (iss.category or "").lower())
    
    # Calculate common issues
    issue_counts = {}
    for iss in issues:
        title = iss.title
        if title not in issue_counts:
            issue_counts[title] = {"count": 0, "severity": iss.severity}
        issue_counts[title]["count"] += 1
        
    common_issues_list = []
    total_issues = len(issues)
    for title, data in sorted(issue_counts.items(), key=lambda x: x[1]["count"], reverse=True)[:5]:
        common_issues_list.append({
            "name": title,
            "severity": data["severity"],
            "count": data["count"],
            "percentage": int((data["count"] / total_issues) * 100) if total_issues > 0 else 0
        })
    
    # 4. Averages
    avg_score = int(sum(r.overall_score for r in completed_reviews) / len(completed_reviews)) if completed_reviews else 0
    
    avg_security = int(sum(r.security_score for r in completed_reviews) / len(completed_reviews)) if completed_reviews else 0
    avg_performance = int(sum(r.performance_score for r in completed_reviews) / len(completed_reviews)) if completed_reviews else 0
    avg_readability = int(sum(r.readability_score for r in completed_reviews) / len(completed_reviews)) if completed_reviews else 0
    avg_testing = int(sum(r.testing_score for r in completed_reviews) / len(completed_reviews)) if completed_reviews else 0
    avg_docs = int(sum(r.documentation_score for r in completed_reviews) / len(completed_reviews)) if completed_reviews else 0
    avg_maintain = int(sum(r.maintainability_score for r in completed_reviews) / len(completed_reviews)) if completed_reviews else 0

    # 5. Format review history list
    formatted_history = []
    for r in sorted(reviews, key=lambda x: x.created_at, reverse=True)[:5]:
        formatted_history.append({
            "id": r.id,
            "review_type": getattr(r, "review_type", "pr"),
            "commit_hash": getattr(r, "commit_hash", None),
            "pr_number": r.pr_number,
            "pr_title": r.pr_title,
            "status": r.status,
            "overall_score": r.overall_score,
            "created_at": r.created_at,
            "repo_name": r.repository.name if r.repository else "unknown"
        })
        
    # 6. Format recent activity logs
    formatted_activity = []
    for iss in sorted(issues, key=lambda x: x.id, reverse=True)[:5]:
        formatted_activity.append({
            "id": iss.id,
            "title": iss.title,
            "severity": iss.severity,
            "file": iss.file_path,
            "agent": iss.agent,
            "review_id": iss.review_id
        })
        
    return {
        "totalReviews": len(reviews),
        "bugsFound": bugs_count,
        "securityIssues": security_count,
        "avgScore": avg_score,
        "reviewsTrend": 0,
        "bugsTrend": 0,
        "securityTrend": 0,
        "scoreTrend": 0,
        "scores": {
            "security": avg_security,
            "performance": avg_performance,
            "readability": avg_readability,
            "testing": avg_testing,
            "documentation": avg_docs,
            "maintainability": avg_maintain
        },
        "recentActivity": formatted_activity,
        "reviewHistory": formatted_history,
        "commonIssues": common_issues_list
    }

@router.get("/{repo_id}/reviews")
def get_repo_reviews(repo_id: int, db: Session = Depends(get_session)):
    """Fetch all PR reviews for a specific repository."""
    statement = select(PRReview).where(PRReview.repository_id == repo_id).order_by(PRReview.created_at.desc())
    reviews = db.exec(statement).all()
    
    return [
        {
            "id": r.id,
            "pr_number": r.pr_number,
            "pr_title": r.pr_title,
            "base_branch": r.base_branch,
            "head_branch": r.head_branch,
            "status": r.status,
            "overall_score": r.overall_score,
            "created_at": r.created_at
        }
        for r in reviews
    ]

@router.post("/rescan-all")
async def rescan_all(owner_id: int, db: Session = Depends(get_session)):
    """Trigger a manual background scan of all repositories for a user."""
    user = db.get(User, owner_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    from app.tasks.auto_scanner import scan_user_repos
    await scan_user_repos(user, force=True)
    
    return {"status": "success", "message": "Rescan of all repositories completed."}

@router.post("/{repo_id}/rescan")
async def rescan_repo(repo_id: int, db: Session = Depends(get_session)):
    """Trigger a manual background scan of a single repository."""
    import asyncio
    
    repo = db.get(Repository, repo_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
        
    from app.services.github_service import github_service
    from app.services.review_service import review_service
    import logging
    logger = logging.getLogger(__name__)
    
    installation_id = await github_service.get_repo_installation_id(repo.full_name)
        
    # Create a full codebase review record
    review = PRReview(
        review_type="full_codebase",
        commit_hash="",
        pr_title=f"[FULL SCAN] {repo.name}",
        base_branch="",
        head_branch="main",
        status="pending",
        repository_id=repo.id
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    
    review_id = review.id
    
    # Run as background task so the frontend gets an immediate response
    asyncio.create_task(review_service.process_pr_review(review_id, installation_id))
    
    return {
        "status": "success", 
        "review_id": review_id, 
        "message": "Scan started. Poll /scan-progress for real-time updates."
    }

@router.get("/{repo_id}/scan-progress")
async def get_scan_progress_endpoint(repo_id: int, db: Session = Depends(get_session)):
    """Get the real-time scan progress for a repository's latest review."""
    from app.services.review_service import get_scan_progress
    
    # Find the latest review for this repo
    statement = select(PRReview).where(
        PRReview.repository_id == repo_id
    ).order_by(PRReview.id.desc())  # type: ignore
    latest_review = db.exec(statement).first()
    
    if not latest_review:
        return {"status": "no_review", "progress_pct": 0}
    
    # Check in-memory progress store first
    progress = get_scan_progress(latest_review.id)
    if progress:
        return {
            "review_id": latest_review.id,
            **progress
        }
    
    # Fallback to DB status
    return {
        "review_id": latest_review.id,
        "status": latest_review.status,
        "current_step": 0 if latest_review.status == "pending" else 5,
        "total_steps": 5,
        "current_agent": "Completed" if latest_review.status == "completed" else latest_review.status.capitalize(),
        "progress_pct": 100 if latest_review.status == "completed" else 0,
        "eta_seconds": 0,
        "messages": [],
    }

