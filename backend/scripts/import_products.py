# scripts/import_products.py
import argparse
import csv
import re
from decimal import Decimal, InvalidOperation
from typing import List
from supabase import create_client, Client

import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()


def _create_supabase_client() -> Client:
    return create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))


# Shared Supabase client
supabase: Client = _create_supabase_client()

# --- CSV Helpers -------------------------------------------------------------

def norm_header(h: str) -> str:
    """Normalize CSV header (remove newlines, double spaces, trim)."""
    return re.sub(r"\s+", " ", (h or "").strip()).lower()

def to_decimal(s: str) -> Decimal:
    if s is None:
        return Decimal("0")
    s = str(s).strip().replace(",", "")
    if s == "":
        return Decimal("0")
    try:
        return Decimal(s)
    except InvalidOperation:
        return Decimal("0")

def to_int(s: str) -> int:
    if s is None:
        return 0
    s = str(s).strip()
    if s == "":
        return 0
    try:
        return int(float(s))
    except ValueError:
        return 0

def make_sku(product_list_tag: str, name: str, pack_size: str) -> str:
    base = product_list_tag if product_list_tag else f"{name}_{pack_size}"
    return re.sub(r"[^A-Za-z0-9]+", "_", base).strip("_").upper()

def row_to_product_payload(row: dict) -> dict:
    """
    Map CSV row to 'products' table fields.

    Expected CSV headers (after normalization):
      sl #, product name, pack size, product list, mrp (tk), trade price (tk) incl. vat,
      retailer profit, total purchage, total sales, total sales amount, commission, stock, status
    """
    nrow = {norm_header(k): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}

    name = nrow.get("product name", "") or ""
    pack_size = nrow.get("pack size", "") or ""
    product_list_tag = nrow.get("product list", "") or ""
    mrp = to_decimal(nrow.get("mrp (tk)", "0"))
    trade_price = to_decimal(nrow.get("trade price (tk) incl. vat", "0"))
    retailer_profit = to_decimal(nrow.get("retailer profit", "0"))
    stock_qty = to_int(nrow.get("stock", "0"))

    status_raw = (nrow.get("status", "") or "").strip().lower()
    status = "active"
    if status_raw in {"discontinued", "inactive"}:
        status = "discontinued"

    sku_code = make_sku(product_list_tag, name, pack_size)

    # Supabase/PostgREST likes numbers or strings; send Decimals as strings
    return dict(
        sku_code=sku_code,
        name=name,
        pack_size=pack_size,
        product_list_tag=product_list_tag,
        mrp=str(mrp),
        trade_price_incl_vat=str(trade_price),
        retailer_profit=str(retailer_profit),
        stock_qty=stock_qty,
        status=status,
        # created_at/updated_at default in DB; product_id is UUID default in DB
    )

# --- Supabase Upsert Logic ---------------------------------------------------

def upsert_products_batch(rows: List[dict], on_conflict: str = "sku_code"):
    """
    Upsert a batch of products by `sku_code`.
    """
    if not rows:
        return
    # Some versions of supabase-py accept on_conflict as string; others as list.
    # We'll prefer string; if your client needs list, swap to on_conflict=[on_conflict].
    supabase.table("products").upsert(rows, on_conflict=on_conflict).execute()

def import_csv(path: str, batch_size: int = 500):
    total_in = 0
    total_upserted = 0
    batch: List[dict] = []

    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Skip empty lines
            if not any(row.values()):
                continue

            payload = row_to_product_payload(row)
            # Skip if no name
            if not payload["name"]:
                continue

            batch.append(payload)
            total_in += 1

            if len(batch) >= batch_size:
                upsert_products_batch(batch)
                total_upserted += len(batch)
                batch.clear()

        # flush remainder
        if batch:
            upsert_products_batch(batch)
            total_upserted += len(batch)
            batch.clear()

    print(f"Read {total_in} CSV rows. Upserted {total_upserted} products.")

# --- CLI ---------------------------------------------------------------------

def main():
    load_dotenv()
    parser = argparse.ArgumentParser(description="Import products CSV into Supabase.")
    parser.add_argument("--csv", required=True, help="Path to CSV file")
    parser.add_argument("--batch", type=int, default=500, help="Batch size for upsert (default: 500)")
    args = parser.parse_args()

    import_csv(args.csv, batch_size=args.batch)

if __name__ == "__main__":
    main()
