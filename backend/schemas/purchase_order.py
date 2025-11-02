# backend/schemas/purchase_order.py
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from models.purchase_order import PurchaseOrderStatus
from models.dealer import Dealer as DealerModel

class DocumentSchema(BaseModel):
    document_id: uuid.UUID
    document_name: str
    document_type: str
    document_url: str
    

class ProductBase(BaseModel):
    product_id: uuid.UUID
    name: str
    pack_size: str
    trade_price_incl_vat: float
    mrp: float

    class Config:
        orm_mode = True

class PurchaseOrderItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItem(PurchaseOrderItemBase):
    po_item_id: int
    po_id: int
    pack_size_snapshot: str
    total_price: float
    product: ProductBase

    class Config:
        orm_mode = True

class PurchaseOrderBase(BaseModel):
    external_ref_code: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    dealer_id: uuid.UUID
    items: List[PurchaseOrderItemCreate]

class PurchaseOrderUpdate(BaseModel):
    external_ref_code: Optional[str] = None
    items: List[PurchaseOrderItemCreate]

class DealerBase(BaseModel):
    dealer_id: uuid.UUID
    company_name: str
    contact_person: str
    contact_number: str
    email: Optional[str] = None
    billing_address: str
    shipping_address: str

    class Config:
        orm_mode = True

class PurchaseOrder(PurchaseOrderBase):
    po_id: int
    po_number: str
    dealer_id: uuid.UUID
    dealer: DealerBase
    created_by_user: uuid.UUID
    po_date: datetime
    status: PurchaseOrderStatus
    total_ex_vat: float
    vat_percent: float
    vat_amount: float
    total_inc_vat: float
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    items: List[PurchaseOrderItem]

    class Config:
        orm_mode = True
        
        @classmethod
        def from_orm(cls, obj):
            # Ensure dealer is properly loaded
            if hasattr(obj, 'dealer') and obj.dealer is None:
                from sqlalchemy.orm import Session
                from core.database import SessionLocal
                db = SessionLocal()
                try:
                    obj.dealer = db.query(DealerModel).filter(DealerModel.dealer_id == obj.dealer_id).first()
                finally:
                    db.close()
            return super().from_orm(obj)


class PurchaseOrderList(BaseModel):
    """Schema for a list of purchase orders with pagination info."""
    items: List[PurchaseOrder]
    total: int
    skip: int
    limit: int

    class Config:
        orm_mode = True
