# backend/api/v1/purchase_orders.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional

from schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderUpdate,
    PurchaseOrder as PurchaseOrderSchema,
    DocumentSchema,
    PurchaseOrderList,
)
from services.purchase_order_service_supabase import (
    PurchaseOrderServiceSB as PurchaseOrderService,
)
from services.document_generation_sevice import DocumentGenerationService
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


@router.get("/my-orders/approved", response_model=PurchaseOrderList, tags=["Purchase Orders"])
def get_my_approved_purchase_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    current_user = Depends(get_current_user),
):
    """
    Get buyer's approved purchase orders (for invoices) with pagination
    """
    if current_user["role"] != "buyer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    orders = PurchaseOrderService.get_my_approved_orders(current_user["user_id"], skip=skip, limit=limit)
    total = PurchaseOrderService.get_my_approved_orders_count(current_user["user_id"])
    return PurchaseOrderList(items=orders, total=total, skip=skip, limit=limit)


@router.get("/my-orders", response_model=PurchaseOrderList, tags=["Purchase Orders"])
def get_my_purchase_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    current_user = Depends(get_current_user),
):
    """
    Get buyer's own purchase orders with pagination
    """
    if current_user["role"] != "buyer":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    orders = PurchaseOrderService.get_my_orders(current_user["user_id"], skip=skip, limit=limit)
    total = PurchaseOrderService.get_my_orders_count(current_user["user_id"])
    return PurchaseOrderList(items=orders, total=total, skip=skip, limit=limit)


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

@router.get("/", response_model=PurchaseOrderList, tags=["Purchase Orders"])
def get_all_purchase_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=1000),
    current_user = Depends(require_roles(UserRole.admin))
):
    """
    Get all purchase orders with pagination (admin only)
    """
    if current_user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    orders = PurchaseOrderService.get_all_purchase_orders(skip=skip, limit=limit)
    total = PurchaseOrderService.get_all_purchase_orders_count()
    return PurchaseOrderList(items=orders, total=total, skip=skip, limit=limit)

@router.get("/{po_id}/invoice", response_model=DocumentSchema, tags=["Purchase Orders"])
def download_invoice(
    po_id: int,
    current_user = Depends(get_current_user),
):
    """
    Download invoice for approved purchase order
    """
    # if current_user["role"] != "buyer":
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # Get purchase order details
    print(f"DEBUG: current_user = {current_user}")
    print(f"DEBUG: current_user role = {current_user.get('role')}")
    print(f"DEBUG: current_user status = {current_user.get('status')}")
    order = PurchaseOrderService.get_purchase_order_details(po_id, current_user["user_id"])

    if order["status"] != "approved":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only approved orders can have invoices")

    DocumentGenerationService.generate_invoice(po_id)
    resp = DocumentSchema(
        document_id=po_id,
        document_name="Invoice",
        document_type="Invoice",
        document_url=""
    )
    return {
        resp
    }

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