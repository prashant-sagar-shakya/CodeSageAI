from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.pr_review import PRReview

class ReviewIssue(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    agent: str  # e.g., "Security", "Performance", "Bug Detection"
    severity: str  # "critical", "warning", "info", "suggestion"
    title: str
    description: str
    file_path: str
    line_number: int
    end_line_number: Optional[int] = None
    explanation: str
    how_to_fix: str
    code_before: str
    code_after: str
    confidence: int
    category: str
    rule: Optional[str] = None
    
    # Review relation
    review_id: int = Field(foreign_key="prreview.id")
    review: "PRReview" = Relationship(back_populates="issues")
