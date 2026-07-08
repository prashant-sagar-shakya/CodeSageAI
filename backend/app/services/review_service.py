import logging
import traceback
from typing import Optional
from sqlmodel import Session
from app.core.database import engine
from app.models.pr_review import PRReview
from app.models.issue import ReviewIssue
from app.agents.orchestrator import orchestrator
from app.services.github_service import github_service

logger = logging.getLogger(__name__)

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

        try:
            # 1. Fetch GitHub app installation token
            token = None
            if installation_id:
                token = await github_service.get_installation_token(installation_id)
                
            # 2. Fetch PR details and diff
            pr_details = await github_service.get_pr_details(repo.full_name, review.pr_number, token)
            diffs = await github_service.get_pr_diff(repo.full_name, review.pr_number, token)
            
            # Formulate structural variables for the agents
            files_summary = (
                f"PR Title: {pr_details.get('title')}\n"
                f"Base Branch: {pr_details.get('base_branch')}\n"
                f"Head Branch: {pr_details.get('head_branch')}\n"
                f"Changed Files Count: {pr_details.get('changed_files')}"
            )
            
            # Standard directory mock structure for RAG analyzer
            repo_tree = (
                "src/\n"
                "  controllers/\n"
                "    productController.ts\n"
                "    orderController.ts\n"
                "  services/\n"
                "    paymentService.ts\n"
                "    orderService.ts\n"
                "  middleware/\n"
                "    auth.ts\n"
                "  config/\n"
                "    stripe.ts\n"
                "  utils/\n"
                "    analytics.ts"
            )
            
            # 3. Run parallel multi-agent analysis via orchestrator
            result = await orchestrator.run_full_review(
                repo_structure=repo_tree,
                diffs=diffs,
                files_summary=files_summary
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
                review.total_files = pr_details.get("changed_files", 0)
                review.total_lines = pr_details.get("additions", 0) + pr_details.get("deletions", 0)
                
                # Propagate health updates to Repository record
                repo_rec = review.repository
                if repo_rec:
                    repo_rec.health_score = review.overall_score
                    db.add(repo_rec)
                
                # Create and bind individual issues
                issues = result.get("issues", [])
                for iss in issues:
                    db_issue = ReviewIssue(
                        agent=iss.get("agent"),
                        severity=iss.get("severity", "info"),
                        title=iss.get("title", "Quality warning"),
                        description=iss.get("description", ""),
                        file_path=iss.get("file", "unknown"),
                        line_number=iss.get("line", 1),
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
                db.commit()
                
            # 5. Write reviews back to GitHub App (if active app tokens are enabled)
            if token and result.get("issues"):
                await github_service.create_pr_review(
                    repo_full_name=repo.full_name,
                    pr_number=review.pr_number,
                    comments=result.get("issues"),
                    token=token
                )
                
            logger.info(f"PR Review task ID {review_id} ran successfully.")
            
        except Exception as e:
            logger.error(f"Process review task crashed for ID {review_id}: {e}\n{traceback.format_exc()}")
            with Session(engine) as db:
                review = db.get(PRReview, review_id)
                if review:
                    review.status = "failed"
                    db.add(review)
                    db.commit()

# Global Singleton
review_service = ReviewService()
