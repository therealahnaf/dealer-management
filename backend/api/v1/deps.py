"""
Dependencies for API endpoints.
"""
from typing import Generator

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from uuid import UUID

from core.database import SessionLocal
from core.security import verify_token
from models.user import User, UserRole, UserStatus
from services.user_service import UserService

security = HTTPBearer()


def get_db() -> Generator:
    """
    Database dependency to get DB session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.
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
    
    # Get user from database
    user = UserService.get_user_by_id(db, UUID(user_id))
    if user is None:
        raise credentials_exception
    
    return user


def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Get current active user.
    """
    if current_user.status != UserStatus.active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


class RoleChecker:
    """
    Dependency class for role-based access.

    Usage:
        - Allow only admins:
            RoleChecker([UserRole.admin])
        - Allow admins or buyers:
            RoleChecker([UserRole.admin, UserRole.buyer])

    In an endpoint:
        @router.get(..., dependencies=[Depends(RoleChecker([UserRole.admin]))])
        or as a parameter to access the user:
        def endpoint(current_user: User = Depends(RoleChecker([UserRole.admin]))):
            ...
    """

    def __init__(self, allowed_roles: list[UserRole] | set[UserRole]):
        self.allowed_roles = set(allowed_roles)

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user


def require_roles(*roles: UserRole):
    """
    Factory dependency to require one of the given roles.

    Example:
        @router.post(...)
        def create(..., current_user: User = Depends(require_roles(UserRole.admin))):
            ...

        @router.get(..., dependencies=[Depends(require_roles(UserRole.admin, UserRole.buyer))])
        def list(...):
            ...
    """

    allowed = set(roles) if roles else {UserRole.admin, UserRole.buyer}

    def dependency(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency