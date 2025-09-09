"""
Public/Buyer-facing Product API endpoints.
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status

from services.product_service_supabase import ProductServiceSB as ProductService
from schemas.product import ProductRead

router = APIRouter()


@router.get("/", response_model=List[ProductRead])
def list_active_products(
    search: Optional[str] = Query(None, description="Search products by name or SKU"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
):
    """
    List all active products.
    Supports searching by name and SKU.
    """
    products = ProductService.get_products(skip=skip, limit=limit, search=search)
    return products


@router.get("/{product_id}", response_model=ProductRead)
def get_product_details(product_id: UUID):
    """
    Get details for a specific product by its ID.
    """
    product = ProductService.get_product_by_id(str(product_id))
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product


@router.get("/search/", response_model=List[ProductRead])
def search_products_by_name_or_sku(
    q: str = Query(..., description="Search term for product name or SKU"),
):
    """
    Search for products by name or SKU.
    """
    if not q:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Search query cannot be empty"
        )
    products = ProductService.search_products(q)
    return products
