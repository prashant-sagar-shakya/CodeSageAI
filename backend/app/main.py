from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.database import init_db
from app.api import auth, repos, prs, reports, webhooks

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Database initialization and application lifecycle context manager."""
    init_db()
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

@app.get("/")
def read_root():
    return {
        "message": "Welcome to CodeSageAI Multi-Agent API Engine",
        "status": "online",
        "docs_url": "/docs"
    }
