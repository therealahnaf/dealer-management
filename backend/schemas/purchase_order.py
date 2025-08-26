# backend/schemas/purchase_order.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid
from ..models.purchase_order import PurchaseOrderStatus

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

class PurchaseOrder(PurchaseOrderBase):
    po_id: int
    po_number: str
    dealer_id: uuid.UUID
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
