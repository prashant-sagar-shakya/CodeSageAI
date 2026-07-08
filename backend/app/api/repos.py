from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.repo import Repository
from app.models.user import User
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
