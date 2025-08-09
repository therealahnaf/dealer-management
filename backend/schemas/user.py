# schemas/user.py (simplified for Pydantic v2)
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from models.user import UserRole, UserStatus


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    contact_number: Optional[str] = Field(default=None, max_length=20)
    status: Optional[UserStatus] = None

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[UserRole] = None
    contact_number: Optional[str] = Field(default=None, max_length=20)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    contact_number: Optional[str] = Field(default=None, max_length=20)
    status: Optional[UserStatus] = None
    password: Optional[str] = None  # optional password change


class UserRead(BaseModel):
    user_id: UUID
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    contact_number: Optional[str] = None
    status: Optional[UserStatus] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None  # user_id as string
    exp: Optional[int] = None  # unix timestamp

class PasswordReset(BaseModel):
    email: EmailStr
    new_password: str
    confirm_new_password: str


__all__ = [
    "UserBase",
    "UserCreate",
    "UserLogin",
    "UserUpdate",
    "UserRead",
    "Token",
    "TokenPayload",
    "PasswordReset",
]
