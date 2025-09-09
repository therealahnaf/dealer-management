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


__all__ = [
    "DealerBase",
    "DealerCreate",
    "DealerUpdate",
    "DealerRead",
]

