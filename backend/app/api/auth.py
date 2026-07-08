from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    github_id: int
    username: str
    name: str
    email: str
    avatar_url: str

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_session)):
    """Authenticate or register a User using their GitHub Profile payload."""
    statement = select(User).where(User.github_id == req.github_id)
    user = db.exec(statement).first()
    
    if not user:
        user = User(
            github_id=req.github_id,
            username=req.username,
            name=req.name,
            email=req.email,
            avatar_url=req.avatar_url
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return {"status": "success", "user": user}
