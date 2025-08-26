# dealer.py
import uuid
from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin

class Dealer(Base, TimestampMixin):
    __tablename__ = "dealers"

    dealer_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="SET NULL"), nullable=True, index=True)

    customer_code = Column(String(50), unique=True, nullable=False, index=True)
    company_name = Column(String(255), nullable=False, index=True)
    contact_person = Column(String(255))
    contact_number = Column(String(20))
    billing_address = Column(Text)
    shipping_address = Column(Text)

    user = relationship("User", back_populates="dealers")
    purchase_orders = relationship("PurchaseOrder", back_populates="dealer")
    # invoices = relationship("Invoice", back_populates="dealer")
