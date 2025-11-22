# backend/schemas/purchase_order.py
from pydantic import BaseModel, Field, ConfigDict
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
    pack_size: Optional[str] = None
    trade_price_incl_vat: float
    mrp: Optional[float] = None

    class Config:
        orm_mode = True
        populate_by_name = True

class PurchaseOrderItemBase(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(..., gt=0)

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItem(BaseModel):
    po_item_id: int
    po_id: int
    product_id: uuid.UUID
    quantity: int
    pack_size_snapshot: Optional[str] = None
    unit_price: float
    total_price: float
    product: Optional[ProductBase] = None

    class Config:
        orm_mode = True

class PurchaseOrderBase(BaseModel):
    pass

class PurchaseOrderCreate(BaseModel):
    dealer_id: uuid.UUID
    items: List[PurchaseOrderItemCreate]

class PurchaseOrderUpdate(BaseModel):
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

class PurchaseOrder(BaseModel):
    po_id: int
    po_number: str
    dealer_id: uuid.UUID
    dealer: Optional[DealerBase] = None
    created_by_user: uuid.UUID
    po_date: datetime
    status: PurchaseOrderStatus
    total_tp: Optional[float] = None
    total_vat: Optional[float] = None
    approved_at: Optional[datetime] = None
    # Calculated fields (not in DB, computed from items)
    total_ex_vat: Optional[float] = None
    vat_percent: Optional[float] = None
    vat_amount: Optional[float] = None
    total_inc_vat: Optional[float] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: List[PurchaseOrderItem] = []

    class Config:
        orm_mode = True


class PurchaseOrderList(BaseModel):
    """Schema for a list of purchase orders with pagination info."""
    items: List[PurchaseOrder]
    total: int
    skip: int
    limit: int

    class Config:
        orm_mode = True
