# backend/app/db/neon_session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

# Create the SQLAlchemy Engine
# Neon handles connection pooling nicely, so standard engine settings work well
engine = create_engine(
    settings.NEON_DATABASE_URL,
    pool_pre_ping=True  # Checks if the connection is alive before querying
)

# Create a SessionLocal class. Each instance of this will be an actual database session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for your database models (like User, Profile, etc.)
Base = declarative_base()

# Dependency function to be used in your FastAPI routes
def get_neon_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()