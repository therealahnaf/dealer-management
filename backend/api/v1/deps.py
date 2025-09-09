"""
Dependencies for API endpoints (Supabase edition).
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from uuid import UUID

from core.security import verify_token
from models.user import UserRole, UserStatus
from services.user_service_supabase import UserServiceSB as UserService

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Get current authenticated user from JWT token (Supabase-backed).
    Returns a dict instead of an ORM object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verify token
    payload = verify_token(credentials.credentials)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # Get user from Supabase
    user = UserService.get_user_by_id(UUID(user_id))
    if not user:
        raise credentials_exception

    return user


def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Ensure the current user is active.
    """
    if current_user["status"] != UserStatus.active.value:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


class RoleChecker:
    """
    Dependency class for role-based access.
    """

    def __init__(self, allowed_roles: list[UserRole] | set[UserRole]):
        self.allowed_roles = set(allowed_roles)

    def __call__(self, current_user: dict = Depends(get_current_active_user)) -> dict:
        if current_user["role"] not in {role.value for role in self.allowed_roles}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user


def require_roles(*roles: UserRole):
    """
    Factory dependency to require one of the given roles.
    """

    allowed = {role.value for role in roles} if roles else {UserRole.admin.value, UserRole.buyer.value}

    def dependency(current_user: dict = Depends(get_current_active_user)) -> dict:
        if current_user["role"] not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency

def get_db():
    pass