"""
Product service for handling product-related business logic.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.product import Product, ProductStatus

class ProductService:
    """Service class for product-related operations."""
    
    @staticmethod
    def get_products(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        search: Optional[str] = None
    ) -> List[Product]:
        """
        Get a list of active products with optional search.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            search: Optional search term to filter by name or SKU
            
        Returns:
            List of Product objects
        """
        query = db.query(Product).filter(Product.status == ProductStatus.ACTIVE)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(search_term),
                    Product.sku_code.ilike(search_term)
                )
            )
            
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: str) -> Optional[Product]:
        """
        Get a single product by ID.
        
        Args:
            db: Database session
            product_id: ID of the product to retrieve
            
        Returns:
            Product object if found, None otherwise
        """
        return db.query(Product).filter(
            Product.product_id == product_id,
            Product.status == ProductStatus.ACTIVE
        ).first()
    
    @staticmethod
    def search_products(db: Session, search_term: str) -> List[Product]:
        """
        Search for products by name or SKU.
        
        Args:
            db: Database session
            search_term: Term to search for in product name or SKU
            
        Returns:
            List of matching Product objects
        """
        search = f"%{search_term}%"
        return db.query(Product).filter(
            Product.status == ProductStatus.ACTIVE,
            or_(
                Product.name.ilike(search),
                Product.sku_code.ilike(search)
            )
        ).all()
