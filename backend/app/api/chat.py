from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from app.core.database import get_session
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.services.sage_agent import sage_agent
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/chat", tags=["sage_agent"])

class CreateSessionRequest(BaseModel):
    user_id: int
    title: Optional[str] = "New Chat"

class ChatRequest(BaseModel):
    message: str

@router.post("/sessions")
def create_chat_session(req: CreateSessionRequest, db: Session = Depends(get_session)):
    user = db.get(User, req.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    session = ChatSession(user_id=req.user_id, title=req.title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/sessions")
def get_chat_sessions(user_id: int, db: Session = Depends(get_session)):
    statement = select(ChatSession).where(ChatSession.user_id == user_id).order_by(ChatSession.updated_at.desc())
    sessions = db.exec(statement).all()
    return sessions

@router.get("/sessions/{session_id}/messages")
def get_chat_messages(session_id: int, db: Session = Depends(get_session)):
    session = db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
    messages = db.exec(statement).all()
    return messages

@router.post("/sessions/{session_id}/messages")
async def send_chat_message(session_id: int, req: ChatRequest, db: Session = Depends(get_session)):
    session = db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
        
    # Save user message
    user_msg = ChatMessage(session_id=session_id, role="user", content=req.message)
    db.add(user_msg)
    db.commit()
    
    try:
        # Fetch history for context (exclude the very last one we just added because we pass it separately)
        statement = select(ChatMessage).where(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc())
        history_msgs = db.exec(statement).all()
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in history_msgs[:-1]]
        
        # Generate AI response
        response_text = await sage_agent.chat(
            user_id=session.user_id,
            message=req.message,
            history=history_dicts
        )
        
        # Save AI response
        ai_msg = ChatMessage(session_id=session_id, role="assistant", content=response_text)
        db.add(ai_msg)
        
        # Update session timestamp
        session.updated_at = datetime.utcnow()
        # Auto-title generation based on the latest message context
        try:
            new_title = await sage_agent.generate_title(req.message)
            if new_title:
                session.title = new_title[:50]
        except Exception:
            if session.title == "New Chat":
                session.title = req.message[:30] + ("..." if len(req.message) > 30 else "")
            
        db.add(session)
        db.commit()
        db.refresh(ai_msg)
        
        return ai_msg
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sage Agent error: {str(e)}")

@router.delete("/sessions/{session_id}")
def delete_chat_session(session_id: int, db: Session = Depends(get_session)):
    session = db.get(ChatSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}
