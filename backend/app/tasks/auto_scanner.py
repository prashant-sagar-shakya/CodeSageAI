import asyncio
import logging
from datetime import datetime
from sqlmodel import Session, select
from app.core.database import engine
from app.models.user import User
from app.models.repo import Repository
from app.services.github_service import github_service
from app.tasks.worker import dispatch_review_task
from app.services.review_service import review_service
from app.models.pr_review import PRReview

logger = logging.getLogger(__name__)

async def scan_user_repos(user: User, force: bool = False):
    """Scan all repositories for a user and trigger reviews if needed."""
    try:
        with Session(engine) as db:
            statement = select(Repository).where(Repository.owner_id == user.id)
            repos = db.exec(statement).all()
            pending_tasks = []
            
            for repo in repos:
                logger.info(f"Auto-Scanner: Dispatching scan for repository {repo.full_name} (User {user.username})")
                
                # Fetch installation id if exists
                installation_id = await github_service.get_repo_installation_id(repo.full_name)
                token = None
                if installation_id:
                    token = await github_service.get_installation_token(installation_id)
                
                # Fetch real recent PRs to scan
                recent_prs = await github_service.get_recent_prs(repo.full_name, token=token, limit=2)
                if recent_prs:
                    for pr in recent_prs:
                        pr_number = pr.get("number")
                        
                        if not force:
                            existing_review_stmt = select(PRReview).where(
                                (PRReview.repository_id == repo.id) & 
                                (PRReview.pr_number == pr_number) &
                                (PRReview.review_type == "pr")
                            )
                            if db.exec(existing_review_stmt).first():
                                continue
                        
                        logger.info(f"Auto-Scanner: Starting review for {repo.full_name} PR #{pr_number}")
                        review = PRReview(
                            review_type="pr",
                            pr_number=pr_number,
                            pr_title=pr.get("title", f"PR #{pr_number}"),
                            base_branch=pr.get("base", {}).get("ref", "main"),
                            head_branch=pr.get("head", {}).get("ref", "feature"),
                            status="pending",
                            repository_id=repo.id
                        )
                        db.add(review)
                        db.commit()
                        db.refresh(review)
                        if force:
                            pending_tasks.append(review_service.process_pr_review(review.id, installation_id))
                        else:
                            dispatch_review_task(review_id=review.id, installation_id=installation_id)

                # Fetch real historical commits to scan (limit 3)
                recent_commits = await github_service.get_recent_commits(repo.full_name, token=token, limit=3)
                if recent_commits:
                    for commit in recent_commits:
                        commit_hash = commit.get("sha")
                        if not commit_hash:
                            continue
                            
                        if not force:
                            existing_review_stmt = select(PRReview).where(
                                (PRReview.repository_id == repo.id) & 
                                (PRReview.commit_hash == commit_hash) &
                                (PRReview.review_type == "commit")
                            )
                            if db.exec(existing_review_stmt).first():
                                continue
                            
                        commit_msg = commit.get("commit", {}).get("message", "Commit update").split("\n")[0]
                        logger.info(f"Auto-Scanner: Starting review for {repo.full_name} Commit {commit_hash[:7]}")
                        
                        review = PRReview(
                            review_type="commit",
                            commit_hash=commit_hash,
                            pr_title=commit_msg,
                            base_branch="",
                            head_branch="main", # Defaulting
                            status="pending",
                            repository_id=repo.id
                        )
                        db.add(review)
                        db.commit()
                        db.refresh(review)
                        if force:
                            pending_tasks.append(review_service.process_pr_review(review.id, installation_id))
                        else:
                            dispatch_review_task(review_id=review.id, installation_id=installation_id)
            
            if pending_tasks:
                logger.info(f"Auto-Scanner: Waiting for {len(pending_tasks)} forced review tasks to complete.")
                await asyncio.gather(*pending_tasks, return_exceptions=True)
                
    except Exception as e:
        logger.error(f"Error during auto-scan for user {user.username}: {e}")

async def start_auto_scanner():
    """Background daemon task that periodically scans repositories for all users."""
    logger.info("Starting CodeSageAI Automated Repository Scanner daemon.")
    
    # 6 hours = 21600 seconds
    # For testing/demo purposes, we could run it once immediately, then sleep for 6 hours
    while True:
        try:
            logger.info("Auto-Scanner: Waking up to process users...")
            with Session(engine) as db:
                statement = select(User)
                users = db.exec(statement).all()
                
            for user in users:
                # Check if subscription is expired (if on paid plan)
                if user.subscription_tier != "free" and user.subscription_expires_at:
                    if datetime.utcnow() > user.subscription_expires_at:
                        logger.warning(f"User {user.username} plan expired. Downgrading to free.")
                        with Session(engine) as db:
                            db_user = db.get(User, user.id)
                            db_user.subscription_tier = "free"
                            db.add(db_user)
                            db.commit()
                            
                # Check limits before scanning
                with Session(engine) as db:
                    first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                    statement = select(PRReview).join(Repository).where(
                        Repository.owner_id == user.id,
                        PRReview.created_at >= first_day_of_month
                    )
                    current_review_count = len(db.exec(statement).all())
                    
                REVIEW_LIMITS = {"free": 5, "basic": 50, "pro": 999999}
                if current_review_count < REVIEW_LIMITS.get(user.subscription_tier, 5):
                    # Proceed with scan
                    await scan_user_repos(user)
                    
            logger.info("Auto-Scanner: Finished routine. Sleeping for 6 hours.")
        except Exception as e:
            logger.error(f"Auto-Scanner: Unexpected error in daemon loop: {e}")
            
        await asyncio.sleep(21600) # Sleep for 6 hours
