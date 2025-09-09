# backend/api/v1/purchase_orders.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from schemas.purchase_order import PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrder as PurchaseOrderSchema
from models.purchase_order import PurchaseOrder as PurchaseOrderModel
from models.user import User
from core.database import get_db
from services.purchase_order_service import PurchaseOrderService
from api.v1.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=PurchaseOrderSchema, status_code=status.HTTP_201_CREATED, tags=["Purchase Orders"])
def create_purchase_order(
    order_in: PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create new purchase order (buyer only)
    """
    if current_user.role != 'buyer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.create_purchase_order(db, order_in, current_user.user_id)

@router.get("/my-orders", response_model=List[PurchaseOrderSchema], tags=["Purchase Orders"])
def get_my_purchase_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get buyer's own purchase orders
    """
    if current_user.role != 'buyer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.get_my_orders(db, current_user.user_id)

@router.get("/{po_id}", response_model=PurchaseOrderSchema, tags=["Purchase Orders"])
def get_purchase_order_details(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get purchase order details (own orders only)
    """
    if current_user.role != 'buyer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    print(f"\n=== DEBUG: Fetching purchase order {po_id} for user {current_user.user_id}")
    try:
        order = PurchaseOrderService.get_purchase_order_details(db, po_id, current_user.user_id)
        print(f"=== DEBUG: Order found: {order is not None}")
        if order:
            print(f"=== DEBUG: Order ID: {order.po_id}, Status: {order.status}")
            print(f"=== DEBUG: Has dealer: {hasattr(order, 'dealer')}")
            if hasattr(order, 'dealer') and order.dealer:
                print(f"=== DEBUG: Dealer ID: {order.dealer.dealer_id}, Name: {getattr(order.dealer, 'company_name', 'N/A')}")
            print(f"=== DEBUG: Number of items: {len(order.items) if hasattr(order, 'items') else 0}")
            if hasattr(order, 'items'):
                for i, item in enumerate(order.items, 1):
                    print(f"  Item {i}: Product ID: {item.product_id}, Has product: {hasattr(item, 'product')}")
                    if hasattr(item, 'product') and item.product:
                        print(f"  - Product Name: {getattr(item.product, 'name', 'N/A')}")
        return order
    except Exception as e:
        print(f"=== DEBUG: Error in get_purchase_order_details: {str(e)}")
        raise

@router.put("/{po_id}", response_model=PurchaseOrderSchema, tags=["Purchase Orders"])
def update_draft_purchase_order(
    po_id: int,
    order_update: PurchaseOrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update draft purchase order (buyer only)
    """
    if current_user.role != 'buyer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.update_draft_purchase_order(db, po_id, order_update, current_user.user_id)

@router.post("/{po_id}/submit", response_model=PurchaseOrderSchema, tags=["Purchase Orders"])
def submit_purchase_order(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit purchase order for approval
    """
    if current_user.role != 'buyer':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return PurchaseOrderService.submit_purchase_order(db, po_id, current_user.user_id)
