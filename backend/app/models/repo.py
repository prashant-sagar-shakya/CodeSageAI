from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.pr_review import PRReview

class Repository(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    github_id: int = Field(unique=True, index=True)
    name: str
    full_name: str = Field(index=True)
    description: Optional[str] = None
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    open_issues: int = 0
    is_private: bool = False
    tech_stack: str = ""  # Comma separated list e.g., "Next.js, FastAPI, PostgreSQL"
    health_score: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Owner relation
    owner_id: int = Field(foreign_key="user.id")
    owner: "User" = Relationship(back_populates="repositories")
    
    # Reviews relation
    reviews: List["PRReview"] = Relationship(back_populates="repository")
