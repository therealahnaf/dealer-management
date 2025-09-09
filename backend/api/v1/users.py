"""
Authentication API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.v1.deps import get_current_user
from core.security import create_access_token
from schemas.user import Token, UserCreate, UserLogin, UserRead, PasswordReset
from services.user_service_supabase import UserServiceSB as UserService
from models.user import User, UserStatus

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(
    user_data: UserCreate,
):
    """
    Register a new user.
    """
    # Check if user already exists
    if UserService.get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = UserService.create_user(user_data)
    return user


@router.post("/login", response_model=Token)
def login_user(user_data: UserLogin):
    """
    Login user and return JWT token.
    """
    # Authenticate user
    user = UserService.authenticate_user(user_data.email, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # user is a dict now
    if user["status"] != UserStatus.active.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": str(user["user_id"]), "role": user["role"]}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(reset_data: PasswordReset):
    """
    Reset user password (no email verification required).
    """
    if reset_data.new_password != reset_data.confirm_new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    success = UserService.reset_password(reset_data.email, reset_data.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {"message": "Password reset successfully"}