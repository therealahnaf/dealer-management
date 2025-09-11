# backend/api/v1/purchase_orders.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderUpdate,
    PurchaseOrder as PurchaseOrderSchema,
)
from services.purchase_order_service_supabase import (
    PurchaseOrderServiceSB as PurchaseOrderService,
)
from api.v1.deps import get_current_user, require_roles
from models.user import UserRole

router = APIRouter()


@router.post("/", response_model=PurchaseOrderSchema, status_code=status.HTTP_201_CREATED, tags=["Purchase Orders"])
def create_purchase_order(
    order_in: PurchaseOrderCreate,
    current_user = Depends(get_current_user),
):
    """
    Create new purchase order (buyer only)
    """
    if current_user["role"] != "buyer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.create_purchase_order(order_in, current_user["user_id"])


@router.get("/my-orders", response_model=List[PurchaseOrderSchema], tags=["Purchase Orders"])
def get_my_purchase_orders(
    current_user = Depends(get_current_user),
):
    """
    Get buyer's own purchase orders
    """
    if current_user["role"] != "buyer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.get_my_orders(current_user["user_id"])


@router.get("/{po_id}", response_model=PurchaseOrderSchema, tags=["Purchase Orders"])
def get_purchase_order_details(
    po_id: int,
    current_user = Depends(get_current_user),
):
    """
    Get purchase order details (own orders only)
    """
    if current_user["role"] != "buyer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.get_purchase_order_details(po_id, current_user["user_id"])


@router.put("/{po_id}", response_model=PurchaseOrderSchema, tags=["Purchase Orders"])
def update_draft_purchase_order(
    po_id: int,
    order_update: PurchaseOrderUpdate,
    current_user = Depends(get_current_user),
):
    """
    Update draft purchase order (buyer only)
    """
    if current_user["role"] != "buyer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.update_draft_purchase_order(po_id, order_update, current_user["user_id"])


@router.post("/{po_id}/submit", response_model=PurchaseOrderSchema, tags=["Purchase Orders"])
def submit_purchase_order(
    po_id: int,
    current_user = Depends(get_current_user),
):
    """
    Submit purchase order for approval
    """
    if current_user["role"] != "buyer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.submit_purchase_order(po_id, current_user["user_id"])

@router.get("/", response_model=List[PurchaseOrderSchema], tags=["Purchase Orders"])
def get_all_purchase_orders(
    current_user = Depends(require_roles(UserRole.admin))
):
    """
    Get all purchase orders (admin only)
    """
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.get_all_purchase_orders()

@router.get("/{dealer_id}/{po_id}", response_model=PurchaseOrderSchema, tags=["Purchase Orders"])
def get_purchase_order_details_by_dealer_and_po_id(
    dealer_id: str,
    po_id: int,
    current_user = Depends(require_roles(UserRole.admin))
):
    """
    Get purchase order details by dealer and po_id (admin only)
    """
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.get_purchase_order_details(po_id, "", dealer_id)
    
@router.put("/{dealer_id}/{po_id}/approve", response_model=PurchaseOrderSchema, tags=["Purchase Orders"])
def approve_purchase_order(
    dealer_id: str,
    po_id: int,
    current_user = Depends(require_roles(UserRole.admin))
):
    """
    Approve purchase order (admin only)
    """
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.approve_purchase_order(dealer_id, po_id)