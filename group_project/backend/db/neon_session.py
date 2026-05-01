from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# Neon Database Engine with connection health checks
engine = create_engine(
    settings.NEON_DATABASE_URL, 
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for FastAPI routes to handle database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()