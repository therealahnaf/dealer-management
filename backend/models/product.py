"""
Product model for managing inventory items."""
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from .base import Base, TimestampMixin
from sqlalchemy.orm import relationship
import enum
import uuid

class ProductStatus(str, enum.Enum):
    ACTIVE = "active"
    DISCONTINUED = "discontinued"

class Product(Base, TimestampMixin):
    __tablename__ = "products"

    product_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False, index=True)
    pack_size = Column(String(50))
    trade_price_incl_vat = Column(Numeric(10, 2), nullable=False)
    stock_qty = Column(Integer, default=0)
    status = Column(Enum(ProductStatus), default=ProductStatus.ACTIVE, nullable=False)
    image = Column(String(255))
    vat = Column(Numeric(5, 2))
    mrp = Column(Numeric(12, 2))
    tp = Column(Numeric(12, 2))

    purchase_order_items = relationship(
        "PurchaseOrderItem", 
        back_populates="product",
        lazy="select"  # Use select loading for the reverse relationship
    )

    def __repr__(self):
        return f"<Product(id={self.product_id}, name='{self.name}')>"
