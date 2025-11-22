# services/product_service_supabase.py
from typing import Optional, List, Dict, Any
from core.database import supabase
import boto3
from botocore.client import Config

class ProductServiceSB:
    BUCKET_NAME = "products"
    S3_ENDPOINT = "https://wauzatpesevxqkbqbwpl.storage.supabase.co/storage/v1/s3"
    S3_REGION = "ap-southeast-1"
    EXPIRATION_SECONDS = 3600  # 1 hour expiration for signed URLs
    
    # S3 client (lazy initialized)
    _s3_client = None

    @staticmethod
    def _get_s3_client():
        """Get or create S3 client using Supabase S3 credentials."""
        if ProductServiceSB._s3_client is None:
            from core.config import settings
            ProductServiceSB._s3_client = boto3.client(
                's3',
                endpoint_url=ProductServiceSB.S3_ENDPOINT,
                aws_access_key_id=settings.S3_ACCESS_KEY_ID,
                aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY,
                region_name=ProductServiceSB.S3_REGION,
                config=Config(signature_version='s3v4')
            )
        return ProductServiceSB._s3_client

    @staticmethod
    def _generate_image_url(image_filename: Optional[str]) -> Optional[str]:
        """Generate signed URL for product image using S3 protocol."""
        if not image_filename:
            return None
        
        try:
            s3_client = ProductServiceSB._get_s3_client()
            # Generate signed URL for the image
            signed_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': ProductServiceSB.BUCKET_NAME, 'Key': image_filename},
                ExpiresIn=ProductServiceSB.EXPIRATION_SECONDS
            )
            return signed_url
        except Exception as e:
            # Log error and return None if URL generation fails
            print(f"Error generating signed URL for {image_filename}: {str(e)}")
            return None

    @staticmethod
    def _enrich_products_with_images(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Add signed image URLs to product data."""
        for product in products:
            if product.get("image"):
                product["image"] = ProductServiceSB._generate_image_url(product["image"])
        return products

    @staticmethod
    def get_products(skip: int = 0, limit: int = 100, search: Optional[str] = None):
        q = supabase.table("products").select("*").eq("status", "active")
        if search:
            like = f"%{search}%"
            q = q.ilike("name", like)
        # Supabase range is inclusive
        res = q.range(skip, skip + limit - 1).execute()
        products = res.data or []
        return ProductServiceSB._enrich_products_with_images(products)

    @staticmethod
    def get_product_by_id(product_id: str):
        res = supabase.table("products").select("*").eq("product_id", product_id).eq("status","active").execute()
        if res.data:
            products = ProductServiceSB._enrich_products_with_images(res.data)
            return products[0]
        return None

    @staticmethod
    def search_products(search_term: str):
        like = f"%{search_term}%"
        res = supabase.table("products").select("*").eq("status","active") \
            .ilike("name", like) \
            .execute()
        products = res.data or []
        return ProductServiceSB._enrich_products_with_images(products)

    @staticmethod
    def get_products_count(search: Optional[str] = None) -> int:
        """Get total count of active products, optionally filtered by search term."""
        q = supabase.table("products").select("*", count="exact").eq("status", "active")
        if search:
            like = f"%{search}%"
            q = q.ilike("name", like)
        res = q.execute()
        return res.count or 0
