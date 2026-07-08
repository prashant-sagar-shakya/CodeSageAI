from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.database import init_db, engine
from app.api import auth, repos, prs, reports, webhooks, payments, chat

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Database initialization and application lifecycle context manager."""
    init_db()
    # One-time migrations
    from sqlmodel import Session, text
    with Session(engine) as session:
        # Fix repos with default health_score=100
        session.exec(text("UPDATE repository SET health_score = 0 WHERE health_score = 100"))
        # Add subscription fields to user if they don't exist
        try:
            session.exec(text("ALTER TABLE \"user\" ADD COLUMN subscription_tier VARCHAR DEFAULT 'free'"))
            session.commit()
        except Exception:
            session.rollback()
            
        try:
            session.exec(text("ALTER TABLE \"user\" ADD COLUMN subscription_expires_at TIMESTAMP"))
            session.commit()
        except Exception:
            session.rollback()
            
        # Commit support migrations
        try:
            session.exec(text("ALTER TABLE prreview ADD COLUMN review_type VARCHAR DEFAULT 'pr'"))
            session.commit()
            print("Auto-migrated: added review_type to prreview")
        except Exception:
            session.rollback()

        try:
            session.exec(text("ALTER TABLE prreview ADD COLUMN commit_hash VARCHAR"))
            session.commit()
            print("Auto-migrated: added commit_hash to prreview")
        except Exception:
            session.rollback()

        try:
            session.exec(text("ALTER TABLE prreview ALTER COLUMN pr_number DROP NOT NULL"))
            session.commit()
        except Exception:
            session.rollback()
        
    # Auto scanner disabled to prevent Gemini API limits
    # import asyncio
    # from app.tasks.auto_scanner import start_auto_scanner
    # asyncio.create_task(start_auto_scanner())
    
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-Agent AI Code Reviewer Platform Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for Next.js frontend calls redirection
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(repos.router, prefix=settings.API_V1_STR)
app.include_router(prs.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(webhooks.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to CodeSageAI Multi-Agent API Engine",
        "status": "online",
        "docs_url": "/docs"
    }
