# backend/services/purchase_order_service.py
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from typing import List, Optional
import uuid
from datetime import datetime
from decimal import Decimal

from ..models import PurchaseOrder, PurchaseOrderItem, Product, Dealer, User
from ..schemas import PurchaseOrderCreate, PurchaseOrderUpdate
from ..models.purchase_order import PurchaseOrderStatus

class PurchaseOrderService:

    VAT_PERCENT = Decimal("15.00")

    @classmethod
    def _generate_po_number(cls, db: Session) -> str:
        last_po = db.query(PurchaseOrder).order_by(PurchaseOrder.po_id.desc()).first()
        last_id = last_po.po_id if last_po else 0
        return f"PO-{last_id + 1:06d}"

    @classmethod
    def create_purchase_order(cls, db: Session, order_in: PurchaseOrderCreate, user_id: uuid.UUID) -> PurchaseOrder:
        # Check if dealer exists and belongs to user
        dealer = db.query(Dealer).filter(Dealer.dealer_id == order_in.dealer_id, Dealer.user_id == user_id).first()
        if not dealer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dealer not found or access denied.")

        total_ex_vat = Decimal(0)
        order_items = []

        for item_in in order_in.items:
            product = db.query(Product).filter(Product.product_id == item_in.product_id).first()
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with id {item_in.product_id} not found")
            
            total_price = Decimal(item_in.quantity) * product.trade_price_incl_vat
            total_ex_vat += total_price

            order_items.append(PurchaseOrderItem(
                product_id=product.product_id,
                quantity=item_in.quantity,
                unit_price=product.trade_price_incl_vat,
                total_price=total_price,
                pack_size_snapshot=product.pack_size
            ))

        vat_amount = total_ex_vat * (cls.VAT_PERCENT / 100)
        total_inc_vat = total_ex_vat + vat_amount

        new_order = PurchaseOrder(
            po_number=cls._generate_po_number(db),
            dealer_id=order_in.dealer_id,
            created_by_user=user_id,
            external_ref_code=order_in.external_ref_code,
            po_date=datetime.utcnow(),
            status=PurchaseOrderStatus.DRAFT,
            total_ex_vat=total_ex_vat,
            vat_percent=cls.VAT_PERCENT,
            vat_amount=vat_amount,
            total_inc_vat=total_inc_vat,
            items=order_items
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order

    @classmethod
    def get_my_orders(cls, db: Session, user_id: uuid.UUID) -> List[PurchaseOrder]:
        return db.query(PurchaseOrder).filter(PurchaseOrder.created_by_user == user_id).all()

    @classmethod
    def get_purchase_order_details(cls, db: Session, po_id: int, user_id: uuid.UUID) -> Optional[PurchaseOrder]:
        order = db.query(PurchaseOrder).options(joinedload(PurchaseOrder.items).joinedload(PurchaseOrderItem.product)).filter(PurchaseOrder.po_id == po_id).first()
        if not order or order.created_by_user != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase Order not found")
        return order

    @classmethod
    def update_draft_purchase_order(cls, db: Session, po_id: int, order_update: PurchaseOrderUpdate, user_id: uuid.UUID) -> Optional[PurchaseOrder]:
        order = cls.get_purchase_order_details(db, po_id, user_id)
        if order.status != PurchaseOrderStatus.DRAFT:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only draft orders can be modified.")

        # Delete old items
        db.query(PurchaseOrderItem).filter(PurchaseOrderItem.po_id == po_id).delete()

        total_ex_vat = Decimal(0)
        order_items = []
        for item_in in order_update.items:
            product = db.query(Product).filter(Product.product_id == item_in.product_id).first()
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product with id {item_in.product_id} not found")
            
            total_price = Decimal(item_in.quantity) * product.trade_price_incl_vat
            total_ex_vat += total_price

            order_items.append(PurchaseOrderItem(
                product_id=product.product_id,
                quantity=item_in.quantity,
                unit_price=product.trade_price_incl_vat,
                total_price=total_price,
                pack_size_snapshot=product.pack_size
            ))

        vat_amount = total_ex_vat * (cls.VAT_PERCENT / 100)
        total_inc_vat = total_ex_vat + vat_amount

        order.external_ref_code = order_update.external_ref_code
        order.total_ex_vat = total_ex_vat
        order.vat_amount = vat_amount
        order.total_inc_vat = total_inc_vat
        order.items = order_items
        order.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(order)
        return order

    @classmethod
    def submit_purchase_order(cls, db: Session, po_id: int, user_id: uuid.UUID) -> Optional[PurchaseOrder]:
        order = cls.get_purchase_order_details(db, po_id, user_id)
        if order.status != PurchaseOrderStatus.DRAFT:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only draft orders can be submitted.")
        order.status = PurchaseOrderStatus.SUBMITTED
        db.commit()
        db.refresh(order)
        return order
