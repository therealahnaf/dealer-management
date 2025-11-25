# backend/services/dashboard_service.py
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from core.database import supabase
from collections import defaultdict

class DashboardService:
    @staticmethod
    def get_stats(user_id: str, role: str):
        # 1. Total Orders
        # For admin, get all. For buyer, get own (though this service is primarily for admin dashboard now)
        if role == "admin":
            res_orders = supabase.table("purchase_orders").select("*", count="exact").execute()
            total_orders = res_orders.count or 0
        else:
            res_orders = supabase.table("purchase_orders").select("*", count="exact").eq("created_by_user", user_id).execute()
            total_orders = res_orders.count or 0

        # 2. Pending Orders (Status: submitted)
        if role == "admin":
            res_pending = supabase.table("purchase_orders").select("*", count="exact").eq("status", "submitted").execute()
            pending_orders = res_pending.count or 0
        else:
            # For buyer, maybe 'submitted' is what they track as pending approval
            res_pending = supabase.table("purchase_orders").select("*", count="exact").eq("created_by_user", user_id).eq("status", "submitted").execute()
            pending_orders = res_pending.count or 0

        # 3. Total Invoices
        # Assuming invoices are visible to admin (all) and buyer (own dealers)
        # For simplicity, if admin, count all.
        if role == "admin":
            res_invoices = supabase.table("invoices").select("*", count="exact").execute()
            total_invoices = res_invoices.count or 0
        else:
            # Buyer needs to find invoices linked to their dealers.
            # This is complex without a direct user_id on invoices, but invoices link to dealers, and dealers link to user_id.
            # For now, let's assume this dashboard is ADMIN ONLY as per request.
            total_invoices = 0 

        # 4. Total Sales Amount (From Purchase Orders Only)
        total_sales_amount = Decimal("0.00")
        if role == "admin":
            # Use approved purchase orders only
            try:
                res_approved = supabase.table("purchase_orders").select("total_tp,total_vat").filter("status", "eq", "approved").execute()
                print(f"Approved orders query result: {len(res_approved.data) if res_approved.data else 0} orders")
                if res_approved.data:
                    for po in res_approved.data:
                        tp = Decimal(str(po.get("total_tp", 0)))
                        vat = Decimal(str(po.get("total_vat", 0)))
                        total_sales_amount += tp + vat
            except Exception as e:
                print(f"Error fetching approved orders: {e}")

        # 5. Total Dealers
        total_dealers = 0
        if role == "admin":
            res_dealers = supabase.table("dealers").select("*", count="exact").execute()
            total_dealers = res_dealers.count or 0

        # 6. Recent Orders (Limit 5)
        recent_orders = []
        if role == "admin":
            res_recent = supabase.table("purchase_orders").select("*").order("po_date", desc=True).limit(5).execute()
            recent_orders = res_recent.data or []
        
        # 7. Top Products (by quantity sold in invoices)
        # If no invoices, fallback to purchase_order_items? Request said "invoice_items".
        # We need to aggregate. Since we can't do complex SQL group by easily with simple client, we might need to fetch all invoice items or use an RPC.
        # For scalability, RPC is better. For now, I will fetch last N invoice items or all if small.
        # Let's try to fetch all invoice items for now (MVP).
        top_products = []
        if role == "admin":
            # Fetch all invoice items
            res_items = supabase.table("invoice_items").select("product_id,quantity,products(name)").execute()
            # If invoice_items is empty, maybe try purchase_order_items for demo data?
            # The user said "invoice_items... you might need to create or update dashboard api".
            
            product_qty_map = defaultdict(int)
            product_name_map = {}
            
            items_data = res_items.data or []
            
            # If no invoice items, fallback to PO items for "Submitted/Approved" orders to show something
            if not items_data:
                 res_po_items = supabase.table("purchase_order_items").select("product_id,quantity,products(name)").execute()
                 items_data = res_po_items.data or []

            for item in items_data:
                pid = item.get("product_id")
                qty = item.get("quantity", 0)
                product_qty_map[pid] += qty
                # products is nested due to select("...,products(name)")
                if item.get("products"):
                    product_name_map[pid] = item.get("products").get("name")
            
            # Sort by qty desc
            sorted_products = sorted(product_qty_map.items(), key=lambda x: x[1], reverse=True)[:5]
            
            for pid, qty in sorted_products:
                top_products.append({
                    "name": product_name_map.get(pid, "Unknown"),
                    "value": qty
                })

        # 8. Monthly Revenue (Last 6 months)
        monthly_revenue = []
        if role == "admin":
            # Fetch approved purchase orders from last 6 months
            six_months_ago = (datetime.now(timezone.utc) - timedelta(days=180)).isoformat()
            try:
                res_rev = supabase.table("purchase_orders").select("po_date,total_tp,total_vat").gte("po_date", six_months_ago).filter("status", "eq", "approved").execute()
                print(f"Monthly revenue query result: {len(res_rev.data) if res_rev.data else 0} orders")
            except Exception as e:
                print(f"Error fetching monthly revenue: {e}")
                res_rev = None
            
            revenue_map = defaultdict(Decimal)
            
            for po in (res_rev.data or []):
                d_str = po.get("po_date")
                tp = Decimal(str(po.get("total_tp", 0)))
                vat = Decimal(str(po.get("total_vat", 0)))
                amount = tp + vat
                
                if d_str:
                    # Parse date, handle various formats if needed, but usually ISO from DB
                    try:
                        dt = datetime.fromisoformat(d_str.replace('Z', '+00:00'))
                        month_key = dt.strftime("%B") # e.g. "January"
                        revenue_map[month_key] += amount
                    except:
                        pass
            
            # We want to ensure order of months? 
            # Let's just return what we have. Frontend can handle or we can sort.
            # Better to return list of {name: Month, total: Amount}
            # To sort correctly, maybe iterate last 6 months and fill.
            
            for i in range(5, -1, -1):
                d = datetime.now(timezone.utc) - timedelta(days=i*30)
                m_name = d.strftime("%B")
                monthly_revenue.append({
                    "name": m_name,
                    "total": float(revenue_map.get(m_name, 0))
                })

        # 9. Dealer Stats (Top Dealers by Revenue)
        dealer_stats = []
        if role == "admin":
             # Fetch approved purchase orders and group by dealer
             # Again, client side aggregation for MVP
             try:
                 res_dealer_po = supabase.table("purchase_orders").select("dealer_id,total_tp,total_vat,dealers(company_name)").filter("status", "eq", "approved").execute()
                 print(f"Dealer stats query result: {len(res_dealer_po.data) if res_dealer_po.data else 0} orders")
             except Exception as e:
                 print(f"Error fetching dealer stats: {e}")
                 res_dealer_po = None
             
             dealer_rev_map = defaultdict(Decimal)
             dealer_name_map = {}
             
             for po in (res_dealer_po.data or []):
                 did = po.get("dealer_id")
                 tp = Decimal(str(po.get("total_tp", 0)))
                 vat = Decimal(str(po.get("total_vat", 0)))
                 amt = tp + vat
                 
                 dealer_rev_map[did] += amt
                 if po.get("dealers"):
                     dealer_name_map[did] = po.get("dealers").get("company_name")
            
             sorted_dealers = sorted(dealer_rev_map.items(), key=lambda x: x[1], reverse=True)[:5]
             for did, amt in sorted_dealers:
                 dealer_stats.append({
                     "name": dealer_name_map.get(did, "Unknown"),
                     "value": float(amt)
                 })

        return {
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "total_invoices": total_invoices,
            "outstanding_amount": float(total_sales_amount),
            "total_dealers": total_dealers,
            "recent_orders": recent_orders,
            "top_products": top_products,
            "monthly_revenue": monthly_revenue,
            "dealer_stats": dealer_stats
        }
