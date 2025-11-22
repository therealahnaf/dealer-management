"""
Dealer schemas for request/response validation.
"""
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict


class DealerBase(BaseModel):
    dealer_id: Optional[UUID] = None
    customer_code: Optional[str] = Field(default=None, max_length=50)
    company_name: Optional[str] = Field(default=None, max_length=255)
    contact_person: Optional[str] = Field(default=None, max_length=255)
    contact_number: Optional[str] = Field(default=None, max_length=20)
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None

    # ORM compatibility when returning model instances
    model_config = ConfigDict(from_attributes=True)


class DealerCreate(BaseModel):
    customer_code: str = Field(..., max_length=50)
    company_name: str = Field(..., max_length=255)
    contact_person: Optional[str] = Field(default=None, max_length=255)
    contact_number: Optional[str] = Field(default=None, max_length=20)
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None


class DealerUpdate(BaseModel):
    customer_code: Optional[str] = Field(default=None, max_length=50)
    company_name: Optional[str] = Field(default=None, max_length=255)
    contact_person: Optional[str] = Field(default=None, max_length=255)
    contact_number: Optional[str] = Field(default=None, max_length=20)
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None


class DealerRead(DealerBase):
    dealer_id: UUID
    user_id: Optional[UUID] = None


class DealerWithUserCreate(BaseModel):
    """Admin endpoint: Create dealer with user account"""
    # User fields
    email: str
    password: str
    full_name: str
    contact_number: Optional[str] = Field(default=None, max_length=20)
    # Dealer fields (customer_code is auto-generated)
    company_name: str = Field(..., max_length=255)
    contact_person: Optional[str] = Field(default=None, max_length=255)
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None


class DealerWithUserRead(BaseModel):
    """Response for dealer with user info"""
    dealer_id: UUID
    customer_code: str
    company_name: str
    contact_person: Optional[str] = None
    contact_number: Optional[str] = None
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None
    user_id: Optional[UUID] = None
    user: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


__all__ = [
    "DealerBase",
    "DealerCreate",
    "DealerUpdate",
    "DealerRead",
    "DealerWithUserCreate",
    "DealerWithUserRead",
]

