from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.user import User
from pydantic import BaseModel
import httpx

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

@router.get("/callback")
async def github_oauth_callback(code: str, db: Session = Depends(get_session)):
    """Exchange OAuth code for GitHub Access Token, fetch user profile, and login."""
    from app.config import settings
    
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(
            status_code=500, 
            detail="GitHub OAuth credentials are not configured on the backend."
        )

    # 1. Exchange code for access token
    token_url = "https://github.com/login/oauth/access_token"
    payload = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "client_secret": settings.GITHUB_CLIENT_SECRET,
        "code": code
    }
    headers = {"Accept": "application/json"}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Request access token
        res = await client.post(token_url, json=payload, headers=headers)
        if res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange OAuth code.")
            
        token_data = res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(
                status_code=400, 
                detail=f"GitHub OAuth error: {token_data.get('error_description', 'No access token returned.')}"
            )
            
        # 2. Fetch user profile using access token
        user_url = "https://api.github.com/user"
        user_headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github+json"
        }
        user_res = await client.get(user_url, headers=user_headers)
        if user_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch GitHub user profile.")
            
        profile = user_res.json()
        
        # 3. Fetch primary email
        emails_url = "https://api.github.com/user/emails"
        emails_res = await client.get(emails_url, headers=user_headers)
        primary_email = None
        if emails_res.status_code == 200:
            emails = emails_res.json()
            
            # 1. First, find a real primary email
            primary_real = next((e.get("email") for e in emails if e.get("primary") and e.get("email") and "@users.noreply.github.com" not in e.get("email")), None)
            
            if primary_real:
                primary_email = primary_real
            else:
                # 2. Look for any real email (not a noreply alias)
                real_emails = [e.get("email") for e in emails if e.get("email") and "@users.noreply.github.com" not in e.get("email")]
                if real_emails:
                    primary_email = real_emails[0]
                else:
                    # 3. Fallback to whatever is marked primary
                    for e in emails:
                        if e.get("primary"):
                            primary_email = e.get("email")
                            break
        
    # 4. Create or login User in PostgreSQL
    github_id = profile.get("id")
    username = profile.get("login")
    name = profile.get("name") or username
    email = primary_email or profile.get("email") or f"{username}@users.noreply.github.com"
    avatar_url = profile.get("avatar_url")
    
    statement = select(User).where(User.github_id == github_id)
    user = db.exec(statement).first()
    
    if not user:
        user = User(
            github_id=github_id,
            username=username,
            name=name,
            email=email,
            avatar_url=avatar_url
        )
        db.add(user)
    else:
        # Update existing user profile with latest GitHub data
        user.username = username
        user.name = name
        # Only overwrite email if it's a noreply email or empty
        if not user.email or "@users.noreply.github.com" in user.email:
            user.email = email
        user.avatar_url = avatar_url
        
    db.commit()
    db.refresh(user)
    
    # 5. Automatically trigger a sync and scan sequence in the background
    from app.tasks.auto_scanner import scan_user_repos
    import asyncio
    
    async def login_auto_sequence(user_id: int, db_session: Session):
        try:
            from app.api.repos import sync_repos
            await sync_repos(owner_id=user_id, db=db_session)
            
            # Fetch fresh user
            fresh_user = db_session.get(User, user_id)
            if fresh_user:
                await scan_user_repos(fresh_user)
        except Exception as e:
            from app.tasks.auto_scanner import logger
            logger.error(f"Login auto-sequence failed for user {user_id}: {e}")
            
    # Spawn the background sequence without blocking login response
    # We create a new session for the background task to avoid concurrency issues with the current session
    from app.core.database import engine
    bg_session = Session(engine)
    asyncio.create_task(login_auto_sequence(user.id, bg_session))
        
    return {
        "status": "success",
        "user": {
            "id": user.id,
            "github_id": user.github_id,
            "username": user.username,
            "name": user.name,
            "email": user.email,
            "avatar_url": user.avatar_url
        },
        "access_token": access_token
    }

class ProfileUpdateRequest(BaseModel):
    name: str
    email: str
    username: str

@router.put("/users/{user_id}")
def update_user_profile(user_id: int, req: ProfileUpdateRequest, db: Session = Depends(get_session)):
    """Update user profile manually."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.name = req.name
    user.email = req.email
    user.username = req.username
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "github_id": user.github_id,
        "username": user.username,
        "name": user.name,
        "email": user.email,
        "avatar_url": user.avatar_url
    }
