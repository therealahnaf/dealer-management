# user.py
import uuid
from enum import Enum
from sqlalchemy import Column, String, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class UserRole(str, Enum):
    admin = "admin"
    buyer = "buyer"

class UserStatus(str, Enum):
    active = "active"
    inactive = "inactive"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    contact_number = Column(String(20))
    status = Column(SAEnum(UserStatus), default=UserStatus.active, nullable=False)

    dealers = relationship("Dealer", back_populates="user", cascade="all, delete-orphan")
