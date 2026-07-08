from sqlmodel import SQLModel, create_engine, Session
from app.config import settings

# SQLite connection args mapping
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL, 
    echo=False, 
    connect_args=connect_args
)

def init_db():
    """Create all relational tables inside the database engine."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency generator giving a local scoped DB session."""
    with Session(engine) as session:
        yield session
