# scripts/populate_products_from_excel.py

import argparse
import os
import sys
import re
from decimal import Decimal
import pandas as pd
from typing import List, Dict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()


def _create_supabase_client() -> Client:
    return create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


# Shared Supabase client
supabase: Client = _create_supabase_client()


def slugify_for_filename(text: str) -> str:
    """Make a filesystem-safe slug from product name."""
    text = str(text or "").strip()
    if not text:
        return ""
    slug = re.sub(r"[^A-Za-z0-9]+", "_", text)
    slug = slug.strip("_")
    return slug[:80] or ""


def get_image_filename(product_name: str, used_slugs: set) -> str:
    """Generate image filename based on product name."""
    if not product_name:
        return None
    
    slug = slugify_for_filename(product_name)
    if not slug:
        return None
    
    final_slug = slug
    counter = 2
    while final_slug in used_slugs:
        final_slug = f"{slug}_{counter}"
        counter += 1
    
    used_slugs.add(final_slug)
    return f"{final_slug}.png"


def clean_decimal_value(value) -> float | None:
    """Clean and convert value to float, handling NaN and invalid values."""
    if pd.isna(value):
        return None
    try:
        return float(Decimal(str(value).strip()))
    except:
        return None


def clean_text_value(value) -> str | None:
    """Clean text value, handling NaN and stripping whitespace."""
    if pd.isna(value):
        return None
    text = str(value).strip()
    return text if text else None


def read_products_from_excel(excel_path: str) -> List[Dict]:
    """
    Read product data from Excel and prepare for database insertion.
    
    Returns list of dictionaries ready for Supabase insertion.
    """
    print(f"Reading Excel: {excel_path}")
    
    # Read Excel (header in row 3, data starts from row 5)
    df = pd.read_excel(excel_path, sheet_name=0, engine="openpyxl", header=2, skiprows=[3])
    
    print(f"Found {len(df)} rows in Excel")
    
    # Find column names (case-insensitive)
    col_product_name = None
    col_pack_size = None
    col_tp_vat = None
    col_vat = None
    col_mrp = None
    col_tp = None
    
    for col in df.columns:
        cl = col.lower()
        if "product" in cl and "name" in cl:
            col_product_name = col
        elif "pack" in cl and "size" in cl:
            col_pack_size = col
        elif cl == "tp+vat":
            col_tp_vat = col
        elif cl == "vat":
            col_vat = col
        elif cl == "mrp":
            col_mrp = col
        elif cl == "tp":
            col_tp = col
    
    if not col_product_name:
        raise ValueError("Could not find 'Product Name' column")
    if not col_tp_vat:
        raise ValueError("Could not find 'TP+VAT' column")
    
    print(f"Found columns: Product Name={col_product_name}, Pack Size={col_pack_size}, TP+VAT={col_tp_vat}")
    
    products = []
    used_slugs = set()
    skipped = 0
    
    for idx, row in df.iterrows():
        product_name = clean_text_value(row.get(col_product_name))
        
        # Skip rows without product name
        if not product_name:
            skipped += 1
            continue
        
        pack_size = clean_text_value(row.get(col_pack_size))
        trade_price_incl_vat = clean_decimal_value(row.get(col_tp_vat))
        vat = clean_decimal_value(row.get(col_vat))
        mrp = clean_decimal_value(row.get(col_mrp))
        tp = clean_decimal_value(row.get(col_tp))
        
        # Skip if no trade price
        if trade_price_incl_vat is None:
            skipped += 1
            continue
        
        # Generate image filename
        image_filename = get_image_filename(product_name, used_slugs)
        
        product = {
            "name": product_name,
            "pack_size": pack_size,
            "trade_price_incl_vat": trade_price_incl_vat,
            "image": image_filename,
            "VAT": vat,
            "MRP": mrp,
            "TP": tp,
            "stock_qty": 0,
            "status": "active"
        }
        
        products.append(product)
    
    print(f"Prepared {len(products)} products for insertion (skipped {skipped} rows)")
    return products


def insert_products_to_supabase(products: List[Dict], clear_existing: bool = False):
    """
    Insert products into Supabase database.
    
    Args:
        products: List of product dictionaries
        clear_existing: If True, clear existing products before inserting
    """
    print(f"Connecting to Supabase...")
    
    try:
        if clear_existing:
            print("Clearing existing products...")
            result = supabase.table("products").delete().neq("product_id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"Cleared existing products")
        
        # Insert products in batches (Supabase has limits)
        batch_size = 100
        total_inserted = 0
        
        for i in range(0, len(products), batch_size):
            batch = products[i:i + batch_size]
            print(f"Inserting batch {i//batch_size + 1} ({len(batch)} products)...")
            
            result = supabase.table("products").insert(batch).execute()
            total_inserted += len(batch)
        
        print(f"✅ Successfully inserted {total_inserted} products!")
        
        # Show sample of inserted data
        result = supabase.table("products").select("product_id, name, pack_size, trade_price_incl_vat").limit(5).execute()
        
        if result.data:
            print("\nSample of inserted products:")
            for product in result.data:
                print(f"  - {product['name']} ({product.get('pack_size', 'N/A')}): {product['trade_price_incl_vat']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise


def main():
    parser = argparse.ArgumentParser(
        description="Populate products table from Excel file using Supabase."
    )
    parser.add_argument("--excel", required=True, help="Path to Excel file (.xlsx)")
    parser.add_argument("--clear", action="store_true", help="Clear existing products before inserting")
    
    args = parser.parse_args()
    
    # Check environment variables
    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_KEY"):
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file")
        sys.exit(1)
    
    # Read products from Excel
    products = read_products_from_excel(args.excel)
    
    # Insert into Supabase
    insert_products_to_supabase(products, clear_existing=args.clear)


if __name__ == "__main__":
    main()