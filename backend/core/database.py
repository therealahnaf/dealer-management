"""
Database configuration and session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from core.config import settings

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

# Lazy-loaded Supabase client
_supabase_client: Client | None = None


def _create_supabase_client() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise RuntimeError("Supabase configuration missing: SUPABASE_URL and SUPABASE_KEY must be set")

    print(settings.SUPABASE_KEY)
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def get_supabase() -> Client:
    """Get or create the Supabase client (lazy initialization)."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = _create_supabase_client()
    return _supabase_client


# For backward compatibility, create a property-like access
class _SupabaseProxy:
    def __getattr__(self, name):
        return getattr(get_supabase(), name)


supabase = _SupabaseProxy()