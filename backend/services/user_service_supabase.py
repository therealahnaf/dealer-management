"""
Authentication service layer (Supabase edition).
"""

from typing import Optional, Dict, Any
from uuid import UUID

from core.security import hash_password, verify_password
from core.logging import get_logger
from core.database import supabase  # your shared Supabase client

logger = get_logger(__name__)


class UserServiceSB:
    """Service class for authentication operations (Supabase)."""

    # ---------- CRUD ----------

    @staticmethod
    def create_user(user_data) -> Dict[str, Any]:
        """
        Create a new user.
        user_data must have: email, password, full_name, role, contact_number
        """
        email = user_data.email.strip().lower()
        logger.info(f"Creating new user with email: {email}")

        # Check if email already exists
        existing = supabase.table("users").select("user_id").eq("email", email).execute()
        if existing.data:
            raise ValueError("Email already registered")

        hashed_password = hash_password(user_data.password)
        payload = {
            "email": email,
            "password_hash": hashed_password,
            "full_name": user_data.full_name,
            "role": user_data.role,
            "contact_number": user_data.contact_number,
        }

        res = supabase.table("users").insert(payload).execute()
        user = res.data[0] if res.data else None
        logger.info(f"Successfully created user with ID: {user.get('user_id') if user else 'N/A'}")
        return user

    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
        """
        Get user by email, or None.
        """
        email = email.strip().lower()
        logger.debug(f"Searching for user with email: {email}")
        res = supabase.table("users").select("*").eq("email", email).execute()
        return res.data[0] if res.data else None

    @staticmethod
    def get_user_by_id(user_id: UUID) -> Optional[Dict[str, Any]]:
        """
        Get user by ID, or None.
        """
        logger.debug(f"Searching for user with ID: {str(user_id)[:8]}...")
        res = supabase.table("users").select("*").eq("user_id", str(user_id)).execute()
        return res.data[0] if res.data else None

    # ---------- Auth flows ----------

    @staticmethod
    def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate user with email and password.
        Returns user dict if OK, else None.
        """
        logger.info(f"Authentication attempt for email: {email}")
        user = UserServiceSB.get_user_by_email(email)
        if not user:
            logger.warning(f"Authentication failed - user not found: {email}")
            return None

        if not verify_password(password, user.get("password_hash", "")):
            logger.warning(f"Authentication failed - invalid password for user: {email}")
            return None

        logger.info(f"Authentication successful for user: {email}")
        return user

    @staticmethod
    def reset_password(email: str, new_password: str) -> bool:
        """
        Reset user password.
        Returns True if updated.
        """
        logger.info(f"Password reset attempt for email: {email}")
        user = UserServiceSB.get_user_by_email(email)
        if not user:
            logger.warning(f"Password reset failed - user not found: {email}")
            return False

        hashed = hash_password(new_password)
        supabase.table("users").update({"password_hash": hashed}).eq("email", email.lower()).execute()
        logger.info(f"Password reset successful for user: {email}")
        return True
