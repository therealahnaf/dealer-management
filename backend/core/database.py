"""
Database configuration and session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from core.config import settings
from dotenv import load_dotenv

load_dotenv()

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG
)

# Session maker
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()


def get_db():
    """Database dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

"""
Database client initialization using application settings.
"""
from supabase import create_client, Client

from .config import settings


def _create_supabase_client() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise RuntimeError("Supabase configuration missing: SUPABASE_URL and SUPABASE_KEY must be set")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


# Shared Supabase client
supabase: Client = _create_supabase_client()