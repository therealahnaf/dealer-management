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
    sku_code: str = Field(..., max_length=100)
    name: str = Field(..., max_length=255)
    pack_size: Optional[str] = Field(None, max_length=50)
    product_list_tag: Optional[str] = Field(None, max_length=100)
    mrp: float = Field(..., gt=0, description="Maximum Retail Price")
    trade_price_incl_vat: float = Field(..., gt=0, description="Trade price including VAT")
    retailer_profit: float = Field(0.0, ge=0, description="Retailer profit amount")
    stock_qty: int = Field(0, ge=0, description="Current stock quantity")
    status: ProductStatus = Field(default=ProductStatus.ACTIVE)

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(ProductBase):
    """Schema for creating a new product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating an existing product."""
    sku_code: Optional[str] = Field(None, max_length=100)
    name: Optional[str] = Field(None, max_length=255)
    pack_size: Optional[str] = Field(None, max_length=50)
    product_list_tag: Optional[str] = Field(None, max_length=100)
    mrp: Optional[float] = Field(None, gt=0, description="Maximum Retail Price")
    trade_price_incl_vat: Optional[float] = Field(None, gt=0, description="Trade price including VAT")
    retailer_profit: Optional[float] = Field(None, ge=0, description="Retailer profit amount")
    stock_qty: Optional[int] = Field(None, ge=0, description="Current stock quantity")
    status: Optional[ProductStatus] = None

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
    query: str = Field(..., description="Search term for product name or SKU")
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
