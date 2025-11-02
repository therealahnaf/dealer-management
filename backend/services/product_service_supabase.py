# services/product_service_supabase.py
from typing import Optional
from core.database import supabase

class ProductServiceSB:
    @staticmethod
    def get_products(skip: int = 0, limit: int = 100, search: Optional[str] = None):
        q = supabase.table("products").select("*").eq("status", "active")
        if search:
            like = f"%{search}%"
            q = q.or_(f"name.ilike.{like},sku_code.ilike.{like}")
        # Supabase range is inclusive
        res = q.range(skip, skip + limit - 1).execute()
        return res.data or []

    @staticmethod
    def get_product_by_id(product_id: str):
        res = supabase.table("products").select("*").eq("product_id", product_id).eq("status","active").execute()
        return res.data[0] if res.data else None

    @staticmethod
    def search_products(search_term: str):
        like = f"%{search_term}%"
        res = supabase.table("products").select("*").eq("status","active") \
            .or_(f"name.ilike.{like},sku_code.ilike.{like}") \
            .execute()
        return res.data or []

    @staticmethod
    def get_products_count(search: Optional[str] = None) -> int:
        """Get total count of active products, optionally filtered by search term."""
        q = supabase.table("products").select("*", count="exact").eq("status", "active")
        if search:
            like = f"%{search}%"
            q = q.or_(f"name.ilike.{like},sku_code.ilike.{like}")
        res = q.execute()
        return res.count or 0
