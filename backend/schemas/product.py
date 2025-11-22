"""
Product schemas for request/response validation.
"""
from typing import Optional
from uuid import UUID
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict

from models.product import ProductStatus


class ProductBase(BaseModel):
    """Base schema for product with common fields."""
    name: str = Field(..., max_length=255)
    pack_size: Optional[str] = Field(None, max_length=50)
    trade_price_incl_vat: float = Field(..., gt=0, description="Trade price including VAT")
    stock_qty: Optional[int] = Field(0, ge=0, description="Current stock quantity")
    status: ProductStatus = Field(default=ProductStatus.ACTIVE)
    image: Optional[str] = Field(None, description="Product image URL")
    vat: Optional[float] = Field(None, description="VAT percentage")
    mrp: Optional[float] = Field(None, description="Maximum Retail Price")
    tp: Optional[float] = Field(None, description="Trade Price")

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(ProductBase):
    """Schema for creating a new product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating an existing product."""
    name: Optional[str] = Field(None, max_length=255)
    pack_size: Optional[str] = Field(None, max_length=50)
    trade_price_incl_vat: Optional[float] = Field(None, gt=0, description="Trade price including VAT")
    stock_qty: Optional[int] = Field(None, ge=0, description="Current stock quantity")
    status: Optional[ProductStatus] = None
    image: Optional[str] = Field(None, description="Product image URL")
    vat: Optional[float] = Field(None, description="VAT percentage")
    mrp: Optional[float] = Field(None, description="Maximum Retail Price")
    tp: Optional[float] = Field(None, description="Trade Price")

    model_config = ConfigDict(from_attributes=True)


class ProductRead(ProductBase):
    """Schema for reading product data (includes read-only fields)."""
    product_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class ProductList(BaseModel):
    """Schema for a list of products with pagination info."""
    items: list[ProductRead]
    total: int
    skip: int
    limit: int

    model_config = ConfigDict(from_attributes=True)


class ProductSearch(BaseModel):
    """Schema for product search parameters."""
    query: str = Field(..., description="Search term for product name")
    skip: int = Field(0, ge=0, description="Number of items to skip")
    limit: int = Field(100, ge=1, le=1000, description="Maximum number of items to return")


__all__ = [
    "ProductBase",
    "ProductCreate",
    "ProductUpdate",
    "ProductRead",
    "ProductList",
    "ProductSearch",
]
