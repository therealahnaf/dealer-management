# backend/models/purchase_order.py
import uuid
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import enum

class PurchaseOrderStatus(str, enum.Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    INVOICED = "invoiced"
    CANCELLED = "cancelled"

class PurchaseOrder(Base, TimestampMixin):
    __tablename__ = "purchase_orders"

    po_id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(50), unique=True, nullable=False, index=True)
    dealer_id = Column(UUID(as_uuid=True), ForeignKey("dealers.dealer_id"), nullable=False, index=True)
    created_by_user = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False, index=True)
    external_ref_code = Column(String(100))
    po_date = Column(DateTime, nullable=False)
    status = Column(Enum(PurchaseOrderStatus), default=PurchaseOrderStatus.DRAFT, nullable=False)
    total_ex_vat = Column(Numeric(10, 2), nullable=False)
    vat_percent = Column(Numeric(5, 2), nullable=False)
    vat_amount = Column(Numeric(10, 2), nullable=False)
    total_inc_vat = Column(Numeric(10, 2), nullable=False)
    approved_at = Column(DateTime)
    combined_po_id = Column(Integer, ForeignKey("purchase_orders.po_id"), nullable=True)

    dealer = relationship(
        "Dealer", 
        back_populates="purchase_orders",
        lazy="joined"  # Always load the dealer with the order
    )
    created_by = relationship("User", back_populates="purchase_orders")
    items = relationship(
        "PurchaseOrderItem", 
        back_populates="purchase_order", 
        cascade="all, delete-orphan",
        lazy="joined"  # Always load items with the order
    )
    combined_po = relationship("PurchaseOrder", remote_side=[po_id])
