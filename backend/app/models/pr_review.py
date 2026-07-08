from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.repo import Repository
    from app.models.issue import ReviewIssue

class PRReview(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    review_type: str = Field(default="pr") # "pr" or "commit"
    pr_number: Optional[int] = None # Optional for commit reviews
    commit_hash: Optional[str] = None # For push event reviews
    pr_title: str # Can be used for commit message
    base_branch: str
    head_branch: str
    status: str = "pending"  # "pending", "processing", "completed", "failed"
    duration: Optional[str] = None
    overall_score: int = 0
    security_score: int = 0
    performance_score: int = 0
    readability_score: int = 0
    testing_score: int = 0
    documentation_score: int = 0
    maintainability_score: int = 0
    total_files: int = 0
    total_lines: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Foreign keys
    repository_id: int = Field(foreign_key="repository.id")
    repository: "Repository" = Relationship(back_populates="reviews")
    
    # Issues relationship
    issues: List["ReviewIssue"] = Relationship(back_populates="review")
