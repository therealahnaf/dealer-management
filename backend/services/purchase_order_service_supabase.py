# services/purchase_order_service_supabase.py
from datetime import datetime, timezone
from decimal import Decimal
from fastapi import HTTPException, status
from core.database import supabase

from datetime import datetime, timezone

def _with_required_fields(order: dict) -> dict:
    # 1) dealer (nested)
    dealer = None
    if order.get("dealer_id"):
        dres = supabase.table("dealers").select("*").eq("dealer_id", order["dealer_id"]).execute()
        dealer = dres.data[0] if dres.data else None

    # 2) items (list)
    ires = supabase.table("purchase_order_items").select("*").eq("po_id", order["po_id"]).execute()
    items = ires.data or []

    # 2a) attach product to each item (bulk fetch for efficiency)
    if items:
        product_ids = list({it["product_id"] for it in items if it.get("product_id")})
        if product_ids:
            pres = supabase.table("products").select("*").in_("product_id", product_ids).execute()
            product_map = {p["product_id"]: p for p in (pres.data or [])}
        else:
            product_map = {}

        # inject nested product
        for it in items:
            it["product"] = product_map.get(it.get("product_id"))

    # 3) created_at / updated_at (your table doesn’t have these; synthesize)
    now_iso = datetime.now(timezone.utc).isoformat()
    created_at = order.get("created_at") or now_iso
    updated_at = order.get("updated_at") or created_at

    return {
        **order,
        "dealer": dealer,
        "items": items,
        "created_at": created_at,
        "updated_at": updated_at,
    }

VAT_PERCENT = Decimal("15.00")

class PurchaseOrderServiceSB:
    @staticmethod
    def _format_po_number(po_id: int) -> str:
        return f"PO-{po_id:06d}"

    @staticmethod
    def create_purchase_order(order_in, user_id: str):
        # 1) Validate dealer belongs to user
        d = supabase.table("dealers").select("dealer_id,user_id") \
            .eq("dealer_id", str(order_in.dealer_id)).eq("user_id", str(user_id)).execute()
        if not d.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dealer not found or access denied.")

        # 2) Create placeholder PO to get po_id
        po_payload = {
            "po_number": "PENDING",
            "dealer_id": str(order_in.dealer_id),
            "created_by_user": str(user_id),
            "external_ref_code": order_in.external_ref_code,
            "po_date": datetime.now(timezone.utc).isoformat(),
            "status": "draft",
            "total_ex_vat": "0.00",
            "vat_percent": str(VAT_PERCENT),
            "vat_amount": "0.00",
            "total_inc_vat": "0.00",
        }
        po_res = supabase.table("purchase_orders").insert(po_payload).execute()
        if not po_res.data:
            raise HTTPException(status_code=500, detail="Failed to create purchase order")
        po = po_res.data[0]
        po_id = po["po_id"]

        # 3) Generate final po_number and update
        final_po_number = PurchaseOrderServiceSB._format_po_number(po_id)
        supabase.table("purchase_orders").update({"po_number": final_po_number}).eq("po_id", po_id).execute()

        # 4) Insert items and compute totals
        total_ex_vat = Decimal("0.00")
        items_payload = []
        for it in order_in.items:
            # fetch product
            p = supabase.table("products").select("product_id,trade_price_incl_vat,pack_size") \
                .eq("product_id", str(it.product_id)).execute()
            if not p.data:
                raise HTTPException(status_code=404, detail=f"Product not found: {it.product_id}")

            pr = p.data[0]
            unit_price = Decimal(str(pr["trade_price_incl_vat"]))
            line_total = unit_price * Decimal(it.quantity)
            total_ex_vat += line_total

            items_payload.append({
                "po_id": po_id,
                "product_id": str(pr["product_id"]),
                "pack_size_snapshot": pr.get("pack_size"),
                "quantity": it.quantity,
                "unit_price": str(unit_price),
                "total_price": str(line_total),
            })

        if items_payload:
            supabase.table("purchase_order_items").insert(items_payload).execute()

        vat_amount = (total_ex_vat * VAT_PERCENT / Decimal("100")).quantize(Decimal("0.01"))
        total_inc_vat = (total_ex_vat + vat_amount).quantize(Decimal("0.01"))

        # 5) Update totals
        supabase.table("purchase_orders").update({
            "total_ex_vat": str(total_ex_vat.quantize(Decimal("0.01"))),
            "vat_amount": str(vat_amount),
            "total_inc_vat": str(total_inc_vat),
        }).eq("po_id", po_id).execute()

        # 6) Return final PO
        out = supabase.table("purchase_orders").select("*").eq("po_id", po_id).execute()
        order = out.data[0] if out.data else None
        if not order:
            raise HTTPException(status_code=500, detail="Purchase order not found after create")
        return _with_required_fields(order)

    def get_my_orders(user_id: str):
        res = supabase.table("purchase_orders") \
            .select("*") \
            .eq("created_by_user", str(user_id)) \
            .order("po_id", desc=True) \
            .execute()
        orders = res.data or []
        # IMPORTANT: enrich each order to match your response_model
        return [_with_required_fields(o) for o in orders]

    @staticmethod
    def approve_purchase_order(dealer_id: int, po_id: int):
        supabase.table("purchase_orders").update({"status": "approved", "approved_at": datetime.now(timezone.utc).isoformat()}).eq("po_id", po_id).eq("dealer_id", str(dealer_id)).execute()
        return PurchaseOrderServiceSB.get_purchase_order_details(po_id, "", dealer_id)

    @staticmethod
    def get_all_purchase_orders():
        res = supabase.table("purchase_orders") \
            .select("*") \
            .order("po_id", desc=True) \
            .execute()
        orders = res.data or []
        # IMPORTANT: enrich each order to match your response_model
        return [_with_required_fields(o) for o in orders]

    @staticmethod
    def get_purchase_order_details(po_id: int, user_id: str, dealer_id: str = None):
        if dealer_id:
            po = supabase.table("purchase_orders").select("*") \
             .eq("po_id", po_id).eq("dealer_id", str(dealer_id)).execute()
        else:
            po = supabase.table("purchase_orders").select("*") \
                .eq("po_id", po_id).eq("created_by_user", str(user_id)).execute()
        if not po.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase Order not found")
        return _with_required_fields(po.data[0])

    @staticmethod
    def update_draft_purchase_order(po_id: int, order_update, user_id: str):
        # check ownership + status
        po = PurchaseOrderServiceSB.get_purchase_order_details(po_id, user_id)
        if po["status"] != "draft":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only draft orders can be modified.")

        # delete old items
        supabase.table("purchase_order_items").delete().eq("po_id", po_id).execute()

        # re-add items
        total_ex_vat = Decimal("0.00")
        items_payload = []
        for it in order_update.items:
            p = supabase.table("products").select("product_id,trade_price_incl_vat,pack_size") \
                .eq("product_id", str(it.product_id)).execute()
            if not p.data:
                raise HTTPException(status_code=404, detail=f"Product not found: {it.product_id}")

            pr = p.data[0]
            unit_price = Decimal(str(pr["trade_price_incl_vat"]))
            line_total = unit_price * Decimal(it.quantity)
            total_ex_vat += line_total

            items_payload.append({
                "po_id": po_id,
                "product_id": str(pr["product_id"]),
                "pack_size_snapshot": pr.get("pack_size"),
                "quantity": it.quantity,
                "unit_price": str(unit_price),
                "total_price": str(line_total),
            })

        if items_payload:
            supabase.table("purchase_order_items").insert(items_payload).execute()

        vat_amount = (total_ex_vat * VAT_PERCENT / Decimal("100")).quantize(Decimal("0.01"))
        total_inc_vat = (total_ex_vat + vat_amount).quantize(Decimal("0.01"))

        supabase.table("purchase_orders").update({
            "external_ref_code": order_update.external_ref_code,
            "total_ex_vat": str(total_ex_vat.quantize(Decimal("0.01"))),
            "vat_amount": str(vat_amount),
            "total_inc_vat": str(total_inc_vat),
        }).eq("po_id", po_id).execute()

        return PurchaseOrderServiceSB.get_purchase_order_details(po_id, user_id)

    @staticmethod
    def submit_purchase_order(po_id: int, user_id: str):
        po = PurchaseOrderServiceSB.get_purchase_order_details(po_id, user_id)
        if po["status"] != "draft":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only draft orders can be submitted.")
        supabase.table("purchase_orders").update({"status": "submitted"}).eq("po_id", po_id).execute()
        return PurchaseOrderServiceSB.get_purchase_order_details(po_id, user_id)
