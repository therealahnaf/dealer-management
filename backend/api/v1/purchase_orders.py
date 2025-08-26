# backend/api/v1/purchase_orders.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from .... import schemas, models
from ....core.database import get_db
from ....services.purchase_order_service import PurchaseOrderService
from ....core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.PurchaseOrder, status_code=status.HTTP_201_CREATED, tags=["Purchase Orders"])
def create_purchase_order(
    order_in: schemas.PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create new purchase order (buyer only)
    """
    if current_user.role != 'buyer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.create_purchase_order(db, order_in, current_user.user_id)

@router.get("/my-orders", response_model=List[schemas.PurchaseOrder], tags=["Purchase Orders"])
def get_my_purchase_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get buyer's own purchase orders
    """
    if current_user.role != 'buyer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.get_my_orders(db, current_user.user_id)

@router.get("/{po_id}", response_model=schemas.PurchaseOrder, tags=["Purchase Orders"])
def get_purchase_order_details(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get purchase order details (own orders only)
    """
    if current_user.role != 'buyer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.get_purchase_order_details(db, po_id, current_user.user_id)

@router.put("/{po_id}", response_model=schemas.PurchaseOrder, tags=["Purchase Orders"])
def update_draft_purchase_order(
    po_id: int,
    order_update: schemas.PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update draft purchase order (buyer only)
    """
    if current_user.role != 'buyer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.update_draft_purchase_order(db, po_id, order_update, current_user.user_id)

@router.post("/{po_id}/submit", response_model=schemas.PurchaseOrder, tags=["Purchase Orders"])
def submit_purchase_order(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Submit purchase order for approval
    """
    if current_user.role != 'buyer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.submit_purchase_order(db, po_id, current_user.user_id)
