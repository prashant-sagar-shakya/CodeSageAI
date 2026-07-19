import logging
import time
import traceback
from typing import Optional, Dict, Any
from sqlmodel import Session
from app.core.database import engine
from app.models.pr_review import PRReview
from app.models.issue import ReviewIssue
from app.agents.orchestrator import orchestrator, AGENT_STEPS
from app.services.github_service import github_service

logger = logging.getLogger(__name__)

# In-memory progress store (keyed by review_id)
# This avoids hammering the DB with updates on every agent step
_scan_progress: Dict[int, Dict[str, Any]] = {}


def get_scan_progress(review_id: int) -> Optional[Dict[str, Any]]:
    """Get the current scan progress for a review."""
    prog = _scan_progress.get(review_id)
    if not prog or prog.get("status") != "processing":
        return prog
        
    # Create a copy to interpolate real-time progress
    prog_copy = prog.copy()
    
    last_update = prog_copy.get("last_update_time", time.time())
    elapsed = time.time() - last_update
    
    step_weight = prog_copy.get("current_step_weight", 0)
    total_weight = prog_copy.get("total_weight", 100)
    
    # We smoothly advance the progress through the current step's weight over an estimated 20s per LLM call.
    # This provides a TRUE real-time continuous progress experience on the frontend!
    fraction = min(elapsed / 20.0, 0.95) # Cap at 95% of the current step
    added_pct = int((step_weight / total_weight) * 100 * fraction)
    
    prog_copy["progress_pct"] = min(prog_copy.get("progress_pct", 0) + added_pct, 99)
    
    if prog_copy.get("eta_seconds"):
        prog_copy["eta_seconds"] = max(0, int(prog_copy["eta_seconds"] - elapsed))
        
    return prog_copy


def clear_scan_progress(review_id: int):
    """Clear progress data after scan completes."""
    _scan_progress.pop(review_id, None)


class ReviewService:
    async def process_pr_review(self, review_id: int, installation_id: Optional[int] = None):
        """Asynchronously process code changes, run multi-agent review, and write findings to DB/GitHub."""
        with Session(engine) as db:
            review = db.get(PRReview, review_id)
            if not review:
                logger.error(f"Database PRReview record {review_id} not found.")
                return
                
            # Update status to processing
            review.status = "processing"
            db.add(review)
            db.commit()
            
            # Fetch repository reference
            repo = review.repository

        # Initialize progress tracking
        start_time = time.time()
        total_steps = len(AGENT_STEPS)
        completed_steps = 0
        
        _scan_progress[review_id] = {
            "status": "processing",
            "current_step": 0,
            "total_steps": total_steps,
            "current_agent": "Initializing...",
            "progress_pct": 0,
            "last_update_time": time.time(),
            "current_step_weight": 5,  # Dummy weight for smooth interpolation during GitHub fetch
            "total_weight": 100,
            "eta_seconds": None,
            "messages": [],
        }

        async def progress_callback(step_name: str, message: str):
            """Called by the orchestrator after each agent step."""
            nonlocal completed_steps
            
            # Find the step index
            step_idx = next(
                (i for i, s in enumerate(AGENT_STEPS) if s["name"] == step_name), 
                completed_steps
            )
            
            if "complete" in message.lower() or "skipped" in message.lower():
                completed_steps = step_idx + 1

            # Calculate base cumulative progress weight (ONLY completed steps)
            weight_completed = sum(s["weight"] for s in AGENT_STEPS[:completed_steps])
            total_weight = sum(s["weight"] for s in AGENT_STEPS)
            base_pct = int((weight_completed / total_weight) * 100)
            
            # Estimate ETA based on elapsed time and progress
            elapsed = time.time() - start_time
            if base_pct > 0:
                estimated_total = elapsed / (base_pct / 100)
                eta = max(0, int(estimated_total - elapsed))
            else:
                eta = None
            # Find the label for the current step
            step_label = next(
                (s["label"] for s in AGENT_STEPS if s["name"] == step_name),
                step_name
            )
            
            _scan_progress[review_id] = {
                "status": "processing",
                "current_step": step_idx + 1,
                "total_steps": total_steps,
                "current_agent": step_label,
                "progress_pct": min(base_pct, 99),  # Base percentage of completed steps
                "last_update_time": time.time(),
                "current_step_weight": AGENT_STEPS[step_idx]["weight"] if step_idx < len(AGENT_STEPS) else 0,
                "total_weight": total_weight,
                "eta_seconds": eta,
                "messages": _scan_progress.get(review_id, {}).get("messages", []) + [
                    {"agent": step_label, "message": message, "timestamp": time.time()}
                ],
            }

        try:
            # 1. Fetch GitHub app installation token
            token = None
            if installation_id:
                token = await github_service.get_installation_token(installation_id)
                
            # 2. Fetch Code Details and Diff based on Review Type
            if review.review_type == "full_codebase":
                diffs = "Full Codebase structural and quality analysis based on repository tree."
                files_summary = (
                    f"Review Type: Full Codebase Scan\n"
                    f"Repository: {repo.full_name}\n"
                    f"Branch: {getattr(repo, 'default_branch', 'main')}"
                )
                tree_sha = getattr(repo, "default_branch", "main")
                pr_details = {"changed_files": 0, "additions": 0, "deletions": 0}
                
            elif review.review_type == "commit":
                # It's a commit review
                diffs = await github_service.get_commit_diff(repo.full_name, review.commit_hash, token)
                files_summary = (
                    f"Review Type: Commit\n"
                    f"Commit Hash: {review.commit_hash}\n"
                    f"Commit Message: {review.pr_title}\n"
                    f"Branch: {review.head_branch}"
                )
                tree_sha = review.commit_hash or review.head_branch or getattr(repo, "default_branch", "main")
                pr_details = {"changed_files": 0, "additions": 0, "deletions": 0}
                
            else:
                # It's a PR review
                pr_details = await github_service.get_pr_details(repo.full_name, review.pr_number, token)
                diffs = await github_service.get_pr_diff(repo.full_name, review.pr_number, token)
                files_summary = (
                    f"Review Type: Pull Request\n"
                    f"PR Title: {pr_details.get('title')}\n"
                    f"Base Branch: {pr_details.get('base_branch')}\n"
                    f"Head Branch: {pr_details.get('head_branch')}\n"
                    f"Changed Files Count: {pr_details.get('changed_files')}"
                )
                tree_sha = pr_details.get("base_sha") or pr_details.get("base_branch") or getattr(repo, "default_branch", "main")

            # Fetch directory structure dynamically from GitHub App API
            repo_tree = await github_service.get_repo_tree(repo.full_name, tree_sha, token)
            
            # 3. Run multi-agent analysis via orchestrator with progress tracking
            result = await orchestrator.run_full_review(
                repo_structure=repo_tree,
                diffs=diffs,
                files_summary=files_summary,
                progress_callback=progress_callback
            )
            
            # 4. Save review results and issue logs
            with Session(engine) as db:
                review = db.get(PRReview, review_id)
                if not review:
                    return
                    
                review.status = "completed"
                review.duration = result.get("duration", "0s")
                
                # Map metrics scores
                scores = result.get("scores", {})
                review.overall_score = scores.get("overall", 100)
                review.security_score = scores.get("security", 100)
                review.performance_score = scores.get("performance", 100)
                review.readability_score = scores.get("readability", 100)
                review.testing_score = scores.get("testing", 100)
                review.documentation_score = scores.get("documentation", 100)
                review.maintainability_score = scores.get("maintainability", 100)
                review.total_files = pr_details.get("changed_files") or 0
                review.total_lines = (pr_details.get("additions") or 0) + (pr_details.get("deletions") or 0)
                
                # Propagate health updates to Repository record
                repo_rec = review.repository
                if repo_rec:
                    repo_rec.health_score = review.overall_score
                    db.add(repo_rec)
                
                # Create and bind individual issues
                issues = result.get("issues", [])
                for iss in issues:
                    try:
                        line_val = iss.get("line", 1)
                        line_num = int(line_val) if line_val is not None else 1
                    except (ValueError, TypeError):
                        line_num = 1
                        
                    db_issue = ReviewIssue(
                        agent=iss.get("agent", "Unknown"),
                        severity=iss.get("severity", "info"),
                        title=iss.get("title", "Quality warning"),
                        description=iss.get("description", ""),
                        file_path=iss.get("file", "unknown"),
                        line_number=line_num,
                        explanation=iss.get("explanation", ""),
                        how_to_fix=iss.get("how_to_fix", ""),
                        code_before=iss.get("code_before", ""),
                        code_after=iss.get("code_after", ""),
                        confidence=iss.get("confidence", 90),
                        category=iss.get("category", "General"),
                        rule=iss.get("rule"),
                        review_id=review.id
                    )
                    db.add(db_issue)
                    
                db.add(review)
                pr_number_val = review.pr_number
                db.commit()
                
            # 5. Write reviews back to GitHub App (if active app tokens are enabled)
            if token and result.get("issues") and pr_number_val:
                await github_service.create_pr_review(
                    repo_full_name=repo.full_name,
                    pr_number=pr_number_val,
                    comments=result.get("issues"),
                    token=token
                )

            # Mark progress as complete
            _scan_progress[review_id] = {
                "status": "completed",
                "current_step": total_steps,
                "total_steps": total_steps,
                "current_agent": "Done",
                "progress_pct": 100,
                "eta_seconds": 0,
                "messages": _scan_progress.get(review_id, {}).get("messages", []),
            }
                
            logger.info(f"PR Review task ID {review_id} ran successfully.")
            
        except Exception as e:
            logger.error(f"Process review task crashed for ID {review_id}: {e}\n{traceback.format_exc()}")
            with Session(engine) as db:
                review = db.get(PRReview, review_id)
                if review:
                    review.status = "failed"
                    db.add(review)
                    db.commit()
            
            # Mark progress as failed
            _scan_progress[review_id] = {
                "status": "failed",
                "current_step": 0,
                "total_steps": total_steps,
                "current_agent": "Failed",
                "progress_pct": 0,
                "eta_seconds": 0,
                "messages": _scan_progress.get(review_id, {}).get("messages", []) + [
                    {"agent": "System", "message": f"Error: {str(e)}", "timestamp": time.time()}
                ],
            }

# Global Singleton
review_service = ReviewService()
