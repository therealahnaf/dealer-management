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

        # inject nested product and calculate line totals
        for it in items:
            product = product_map.get(it.get("product_id"))
            it["product"] = product
            # Calculate unit_price and total_price from product data
            if product:
                unit_price = Decimal(str(product.get("trade_price_incl_vat", "0")))
                it["unit_price"] = float(unit_price)
                it["total_price"] = float(unit_price * Decimal(it.get("quantity", 0)))
                it["pack_size_snapshot"] = product.get("pack_size")

    # 3) Calculate totals from items
    total_tp = Decimal("0.00")
    for it in items:
        total_tp += Decimal(str(it.get("total_price", 0)))
    
    total_vat = (total_tp * VAT_PERCENT / Decimal("100")).quantize(Decimal("0.01"))
    total_inc_vat = (total_tp + total_vat).quantize(Decimal("0.01"))

    # 4) created_at / updated_at (your table doesn't have these; synthesize)
    now_iso = datetime.now(timezone.utc).isoformat()
    created_at = order.get("created_at") or now_iso
    updated_at = order.get("updated_at") or created_at

    return {
        **order,
        "dealer": dealer,
        "items": items,
        "created_at": created_at,
        "updated_at": updated_at,
        "total_ex_vat": float(total_tp),
        "total_vat": float(total_vat),
        "total_inc_vat": float(total_inc_vat),
        "vat_percent": float(VAT_PERCENT),
        "vat_amount": float(total_vat),
    }

VAT_PERCENT = Decimal("15.00")

class PurchaseOrderServiceSB:
    @staticmethod
    def _get_dealer_initials(dealer_id: str) -> str:
        """
        Get dealer initials from contact_person name.
        Extracts capital first letter of each word.
        Example: "John Doe" -> "JD", "Ahmed Bin Laden" -> "ABL"
        """
        try:
            dealer_res = supabase.table("dealers").select("contact_person").eq("dealer_id", str(dealer_id)).execute()
            if not dealer_res.data:
                return "XX"  # Fallback if dealer not found
            
            contact_person = dealer_res.data[0].get("contact_person", "")
            if not contact_person:
                return "XX"  # Fallback if contact_person is empty
            
            # Extract initials: capital first letter of each word
            words = contact_person.strip().split()
            initials = "".join(word[0].upper() for word in words if word)
            
            return initials if initials else "XX"
        except Exception:
            return "XX"  # Fallback on any error

    @staticmethod
    def _get_unique_dealer_prefix(dealer_id: str) -> str:
        """
        Get unique dealer prefix handling collisions.
        If multiple dealers have same initials, append a numeric suffix.
        Example: "Ahnaf Hassan" and "Ahrar Hashmi" both have "AH" initials
        - First dealer to create PO: "AH-001"
        - Second dealer with same initials: "AH1-001" (collision suffix added)
        """
        initials = PurchaseOrderServiceSB._get_dealer_initials(dealer_id)
        
        try:
            # Find all dealers with the same initials
            all_dealers = supabase.table("dealers").select("dealer_id,contact_person").execute()
            dealers_with_same_initials = []
            
            for dealer in (all_dealers.data or []):
                dealer_initials = PurchaseOrderServiceSB._get_dealer_initials(dealer["dealer_id"])
                if dealer_initials == initials:
                    dealers_with_same_initials.append(dealer["dealer_id"])
            
            # If only one dealer has these initials, return as-is
            if len(dealers_with_same_initials) == 1:
                return initials
            
            # Multiple dealers with same initials - find this dealer's position
            # Sort by dealer_id to ensure consistent ordering
            dealers_with_same_initials.sort()
            collision_index = dealers_with_same_initials.index(str(dealer_id))
            
            # Append numeric suffix (0, 1, 2, etc.)
            # Only add suffix for dealers after the first one
            if collision_index == 0:
                return initials
            else:
                return f"{initials}{collision_index}"
        except Exception:
            return initials  # Fallback to initials without suffix on error

    @staticmethod
    def _format_po_number(dealer_id: str, sequence_num: int) -> str:
        """
        Format PO number as PREFIX-### (e.g., AB-001, AH-001, AH1-001)
        Handles collision by appending numeric suffix to initials if needed.
        """
        prefix = PurchaseOrderServiceSB._get_unique_dealer_prefix(dealer_id)
        return f"{prefix}-{sequence_num:03d}"

    @staticmethod
    def create_purchase_order_as_admin(order_in, admin_user_id: str):
        """
        Create a purchase order as admin for a specific dealer.
        The dealer_id must be specified in order_in.
        """
        # 1) Validate dealer exists (no user validation needed for admin)
        d = supabase.table("dealers").select("dealer_id") \
            .eq("dealer_id", str(order_in.dealer_id)).execute()
        if not d.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dealer not found.")

        # 2) Generate po_number BEFORE creating the PO to avoid race conditions
        existing_pos = supabase.table("purchase_orders").select("*", count="exact") \
            .eq("dealer_id", str(order_in.dealer_id)) \
            .execute()
        
        sequence_num = (existing_pos.count or 0) + 1
        po_number = PurchaseOrderServiceSB._format_po_number(str(order_in.dealer_id), sequence_num)

        # 3) Create PO with generated po_number
        po_payload = {
            "po_number": po_number,
            "dealer_id": str(order_in.dealer_id),
            "created_by_user": str(admin_user_id),
            "po_date": datetime.now(timezone.utc).isoformat(),
            "status": "draft",
        }
        po_res = supabase.table("purchase_orders").insert(po_payload).execute()
        if not po_res.data:
            raise HTTPException(status_code=500, detail="Failed to create purchase order")
        po = po_res.data[0]
        po_id = po["po_id"]

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
                "quantity": it.quantity,
            })

        if items_payload:
            supabase.table("purchase_order_items").insert(items_payload).execute()

        vat_amount = (total_ex_vat * VAT_PERCENT / Decimal("100")).quantize(Decimal("0.01"))
        total_inc_vat = (total_ex_vat + vat_amount).quantize(Decimal("0.01"))

        supabase.table("purchase_orders").update({
            "total_tp": str(total_ex_vat.quantize(Decimal("0.01"))),
            "total_vat": str(vat_amount),
        }).eq("po_id", po_id).execute()

        # 6) Return final PO
        out = supabase.table("purchase_orders").select("*").eq("po_id", po_id).execute()
        order = out.data[0] if out.data else None
        if not order:
            raise HTTPException(status_code=500, detail="Purchase order not found after create")
        return _with_required_fields(order)

    @staticmethod
    def create_purchase_order(order_in, user_id: str):
        # 1) Validate dealer belongs to user
        d = supabase.table("dealers").select("dealer_id,user_id") \
            .eq("dealer_id", str(order_in.dealer_id)).eq("user_id", str(user_id)).execute()
        if not d.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dealer not found or access denied.")

        # 2) Generate po_number BEFORE creating the PO to avoid race conditions
        # Get the maximum sequence number for this dealer by counting all POs for this dealer
        existing_pos = supabase.table("purchase_orders").select("*", count="exact") \
            .eq("dealer_id", str(order_in.dealer_id)) \
            .execute()
        
        # Next sequence number is count + 1 (since sequences start at 1)
        sequence_num = (existing_pos.count or 0) + 1
        
        po_number = PurchaseOrderServiceSB._format_po_number(str(order_in.dealer_id), sequence_num)

        # 3) Create PO with generated po_number
        po_payload = {
            "po_number": po_number,
            "dealer_id": str(order_in.dealer_id),
            "created_by_user": str(user_id),
            "po_date": datetime.now(timezone.utc).isoformat(),
            "status": "draft",
        }
        po_res = supabase.table("purchase_orders").insert(po_payload).execute()
        if not po_res.data:
            raise HTTPException(status_code=500, detail="Failed to create purchase order")
        po = po_res.data[0]
        po_id = po["po_id"]

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
                "quantity": it.quantity,
            })

        if items_payload:
            supabase.table("purchase_order_items").insert(items_payload).execute()

        # 5) Calculate and store totals
        vat_amount = (total_ex_vat * VAT_PERCENT / Decimal("100")).quantize(Decimal("0.01"))
        total_inc_vat = (total_ex_vat + vat_amount).quantize(Decimal("0.01"))

        supabase.table("purchase_orders").update({
            "total_tp": str(total_ex_vat.quantize(Decimal("0.01"))),
            "total_vat": str(vat_amount),
        }).eq("po_id", po_id).execute()

        # 6) Return final PO
        out = supabase.table("purchase_orders").select("*").eq("po_id", po_id).execute()
        order = out.data[0] if out.data else None
        if not order:
            raise HTTPException(status_code=500, detail="Purchase order not found after create")
        return _with_required_fields(order)

    @staticmethod
    def get_my_orders(user_id: str, skip: int = 0, limit: int = 100):
        res = supabase.table("purchase_orders") \
            .select("*") \
            .eq("created_by_user", str(user_id)) \
            .order("po_id", desc=True) \
            .range(skip, skip + limit - 1) \
            .execute()
        orders = res.data or []
        # IMPORTANT: enrich each order to match your response_model
        return [_with_required_fields(o) for o in orders]

    @staticmethod
    def get_my_orders_count(user_id: str) -> int:
        """Get total count of user's purchase orders."""
        res = supabase.table("purchase_orders") \
            .select("*", count="exact") \
            .eq("created_by_user", str(user_id)) \
            .execute()
        return res.count or 0

    @staticmethod
    def get_my_approved_orders(user_id: str, skip: int = 0, limit: int = 100):
        res = supabase.table("purchase_orders") \
            .select("*") \
            .eq("created_by_user", str(user_id)) \
            .eq("status", "approved") \
            .order("po_id", desc=True) \
            .range(skip, skip + limit - 1) \
            .execute()
        orders = res.data or []
        # IMPORTANT: enrich each order to match your response_model
        return [_with_required_fields(o) for o in orders]

    @staticmethod
    def get_my_approved_orders_count(user_id: str) -> int:
        """Get total count of user's approved purchase orders."""
        res = supabase.table("purchase_orders") \
            .select("*", count="exact") \
            .eq("created_by_user", str(user_id)) \
            .eq("status", "approved") \
            .execute()
        return res.count or 0

    @staticmethod
    def approve_purchase_order(dealer_id: int, po_id: int):
        supabase.table("purchase_orders").update({"status": "approved", "approved_at": datetime.now(timezone.utc).isoformat()}).eq("po_id", po_id).eq("dealer_id", str(dealer_id)).execute()
        return PurchaseOrderServiceSB.get_purchase_order_details(po_id, "", dealer_id)

    @staticmethod
    def get_all_purchase_orders(skip: int = 0, limit: int = 100):
        res = supabase.table("purchase_orders") \
            .select("*") \
            .order("po_id", desc=True) \
            .range(skip, skip + limit - 1) \
            .execute()
        orders = res.data or []
        # IMPORTANT: enrich each order to match your response_model
        return [_with_required_fields(o) for o in orders]

    @staticmethod
    def get_all_purchase_orders_count() -> int:
        """Get total count of all purchase orders."""
        res = supabase.table("purchase_orders") \
            .select("*", count="exact") \
            .execute()
        return res.count or 0

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
                "quantity": it.quantity,
            })

        if items_payload:
            supabase.table("purchase_order_items").insert(items_payload).execute()

        # Calculate and store totals
        vat_amount = (total_ex_vat * VAT_PERCENT / Decimal("100")).quantize(Decimal("0.01"))
        total_inc_vat = (total_ex_vat + vat_amount).quantize(Decimal("0.01"))

        supabase.table("purchase_orders").update({
            "total_tp": str(total_ex_vat.quantize(Decimal("0.01"))),
            "total_vat": str(vat_amount),
        }).eq("po_id", po_id).execute()

        return PurchaseOrderServiceSB.get_purchase_order_details(po_id, user_id)

    @staticmethod
    def submit_purchase_order(po_id: int, user_id: str):
        po = PurchaseOrderServiceSB.get_purchase_order_details(po_id, user_id)
        if po["status"] != "draft":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only draft orders can be submitted.")
        supabase.table("purchase_orders").update({"status": "submitted"}).eq("po_id", po_id).execute()
        return PurchaseOrderServiceSB.get_purchase_order_details(po_id, user_id)
