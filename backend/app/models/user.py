from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.models.repo import Repository

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    github_id: int = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    subscription_tier: str = Field(default="free", index=True)
    subscription_expires_at: Optional[datetime] = None
    
    # Relationships
    repositories: List["Repository"] = Relationship(back_populates="owner")
