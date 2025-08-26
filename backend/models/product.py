"""
Product model for managing inventory items."""
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .base import Base, TimestampMixin
import enum
import uuid

class ProductStatus(str, enum.Enum):
    ACTIVE = "active"
    DISCONTINUED = "discontinued"

class Product(Base, TimestampMixin):
    __tablename__ = "products"

    product_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    sku_code = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    pack_size = Column(String(50))
    product_list_tag = Column(String(100))
    mrp = Column(Numeric(10, 2), nullable=False)
    trade_price_incl_vat = Column(Numeric(10, 2), nullable=False)
    retailer_profit = Column(Numeric(10, 2), default=0.00)
    stock_qty = Column(Integer, default=0)
    status = Column(Enum(ProductStatus), default=ProductStatus.ACTIVE, nullable=False)

    def __repr__(self):
        return f"<Product(id={self.product_id}, name='{self.name}', sku='{self.sku_code}')>"
