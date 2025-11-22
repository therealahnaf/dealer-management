# backend/api/v1/purchase_orders.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from pathlib import Path
import tempfile
import logging
import io

from api.v1.deps import get_current_user

logger = logging.getLogger(__name__)
from core.security import create_access_token
from schemas.purchase_order import PurchaseOrderCreate, PurchaseOrderUpdate, PurchaseOrder, PurchaseOrderList, DocumentSchema
from services.purchase_order_service_supabase import PurchaseOrderServiceSB as PurchaseOrderService
from services.document_generation_sevice import DocumentGenerationService
from services.invoice_generator_service import InvoiceGeneratorService
from services.po_generator_service import POGeneratorService
from api.v1.deps import get_current_user, require_roles
from models.user import UserRole

router = APIRouter()


@router.post("/", response_model=PurchaseOrder, status_code=status.HTTP_201_CREATED, tags=["Purchase Orders"])
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


@router.post("/admin/create-for-dealer", response_model=PurchaseOrder, status_code=status.HTTP_201_CREATED, tags=["Purchase Orders"])
def admin_create_purchase_order_for_dealer(
    order_in: PurchaseOrderCreate,
    current_user = Depends(require_roles(UserRole.admin)),
):
    """
    Create purchase order for a specific dealer (admin only)
    Admin can create orders on behalf of dealers
    """
    return PurchaseOrderService.create_purchase_order_as_admin(order_in, current_user["user_id"])


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


@router.get("/{po_id}", response_model=PurchaseOrder, tags=["Purchase Orders"])
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


@router.put("/{po_id}", response_model=PurchaseOrder, tags=["Purchase Orders"])
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


@router.post("/{po_id}/submit", response_model=PurchaseOrder, tags=["Purchase Orders"])
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

@router.get("/{po_id}/invoice", tags=["Purchase Orders"])
def download_invoice(
    po_id: int,
    current_user = Depends(get_current_user),
):
    """
    Download invoice for approved purchase order (PDF)
    """
    logger.info(f"Invoice download request for PO ID: {po_id} by user: {current_user.get('user_id')}")
    try:
        # Get purchase order details
        logger.info(f"Fetching purchase order details for PO ID: {po_id}")
        order = PurchaseOrderService.get_purchase_order_details(po_id, current_user["user_id"])
        logger.info(f"PO retrieved - Status: {order.get('status')}")

        if order["status"] != "approved":
            logger.warning(f"Invoice download attempted for non-approved PO {po_id} - Status: {order['status']}")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only approved orders can have invoices")

        # Get template path
        template_path = Path(__file__).parent.parent.parent / "static" / "templates" / "invoice_template.docx"
        logger.debug(f"Template path: {template_path}")
        if not template_path.exists():
            logger.error(f"Invoice template not found at: {template_path}")
            raise HTTPException(status_code=500, detail="Invoice template not found")
        
        logger.info(f"Template found, starting invoice generation")
        # Generate invoice (uses persistent output directory)
        docx_path, pdf_path = InvoiceGeneratorService.generate_invoice_for_po(
            po_id=po_id,
            template_path=template_path
        )
        
        logger.info(f"Invoice generation completed - DOCX: {docx_path}, PDF: {pdf_path}")
        
        # Return PDF if available, otherwise DOCX
        file_to_return = pdf_path if pdf_path and pdf_path.exists() else docx_path
        logger.info(f"File to return: {file_to_return}")
        
        if not file_to_return or not file_to_return.exists():
            logger.error(f"Generated file does not exist: {file_to_return}")
            raise HTTPException(status_code=500, detail="Failed to generate invoice")
        
        logger.info(f"Reading file content: {file_to_return}")
        # Read file content into memory
        with open(file_to_return, "rb") as f:
            file_content = f.read()
        
        filename = file_to_return.name
        media_type = "application/pdf" if file_to_return.suffix == ".pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        logger.info(f"File response - Name: {filename}, Type: {media_type}, Size: {len(file_content)} bytes")
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except HTTPException:
        logger.error(f"HTTP Exception raised for PO {po_id}")
        raise
    except Exception as e:
        logger.error(f"Error generating invoice for PO {po_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate invoice: {str(e)}")

@router.get("/{po_id}/po", tags=["Purchase Orders"])
def download_po(
    po_id: int,
    current_user = Depends(get_current_user)
):
    """
    Download PO as PDF or DOCX
    """
    try:
        logger.info(f"PO download request for PO ID: {po_id}")
        
        # Get template path
        template_path = Path(__file__).parent.parent.parent / "static" / "templates" / "purchase_order_template.docx"
        logger.debug(f"Template path: {template_path}")
        if not template_path.exists():
            logger.error(f"PO template not found at: {template_path}")
            raise HTTPException(status_code=500, detail="PO template not found")
        
        logger.info(f"Template found, starting PO generation")
        # Generate PO (uses persistent output directory)
        docx_path, pdf_path = POGeneratorService.generate_po_for_dealer(
            po_id=po_id,
            template_path=template_path
        )
        
        logger.info(f"PO generation completed - DOCX: {docx_path}, PDF: {pdf_path}")
        
        # Return PDF if available, otherwise DOCX
        file_to_return = pdf_path if pdf_path and pdf_path.exists() else docx_path
        logger.info(f"File to return: {file_to_return}")
        
        if not file_to_return or not file_to_return.exists():
            logger.error(f"Generated file does not exist: {file_to_return}")
            raise HTTPException(status_code=500, detail="Failed to generate PO")
        
        logger.info(f"Reading file content: {file_to_return}")
        # Read file content into memory
        with open(file_to_return, "rb") as f:
            file_content = f.read()
        
        filename = file_to_return.name
        media_type = "application/pdf" if file_to_return.suffix == ".pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        
        logger.info(f"File response - Name: {filename}, Type: {media_type}, Size: {len(file_content)} bytes")
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except HTTPException:
        logger.error(f"HTTP Exception raised for PO {po_id}")
        raise
    except Exception as e:
        logger.error(f"Error generating PO for PO {po_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate PO: {str(e)}")

@router.get("/{dealer_id}/{po_id}", response_model=PurchaseOrder, tags=["Purchase Orders"])
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
@router.put("/{dealer_id}/{po_id}/approve", response_model=PurchaseOrder, tags=["Purchase Orders"])
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