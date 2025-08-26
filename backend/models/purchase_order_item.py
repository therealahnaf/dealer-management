# backend/models/purchase_order_item.py
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    po_item_id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.po_id"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.product_id"), nullable=False, index=True)
    pack_size_snapshot = Column(String(50))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product", back_populates="purchase_order_items")
