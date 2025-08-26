# scripts/import_products.py
import argparse
import csv
import re
from decimal import Decimal, InvalidOperation

from sqlalchemy.orm import Session

# adjust imports to your project layout

import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import SessionLocal
from models.product import Product, ProductStatus

from dotenv import load_dotenv

load_dotenv()

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
    if product_list_tag:
        base = product_list_tag
    else:
        base = f"{name}_{pack_size}"
    return re.sub(r"[^A-Za-z0-9]+", "_", base).strip("_").upper()


def row_to_product_kwargs(row: dict) -> dict:
    """
    Map CSV row to Product fields.
    CSV headers (after normalization):
      sl #, product name, pack size, product list, mrp (tk), trade price (tk) incl. vat,
      retailer profit, total purchage, total sales, total sales amount, commission, stock, status
    """
    # normalize keys once
    nrow = {norm_header(k): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}

    name = nrow.get("product name", "") or ""
    pack_size = nrow.get("pack size", "") or ""
    product_list_tag = nrow.get("product list", "") or ""
    mrp = to_decimal(nrow.get("mrp (tk)", "0"))
    trade_price = to_decimal(nrow.get("trade price (tk) incl. vat", "0"))
    retailer_profit = to_decimal(nrow.get("retailer profit", "0"))
    stock_qty = to_int(nrow.get("stock", "0"))
    status_raw = (nrow.get("status", "") or "").strip().lower()

    status = ProductStatus.ACTIVE
    if status_raw in {"discontinued", "inactive"}:
        status = ProductStatus.DISCONTINUED

    sku_code = make_sku(product_list_tag, name, pack_size)

    return dict(
        sku_code=sku_code,
        name=name,
        pack_size=pack_size,
        product_list_tag=product_list_tag,
        mrp=mrp,
        trade_price_incl_vat=trade_price,
        retailer_profit=retailer_profit,
        stock_qty=stock_qty,
        status=status,
    )


def upsert_product(db: Session, data: dict):
    obj = db.query(Product).filter(Product.sku_code == data["sku_code"]).one_or_none()
    if obj:
        # update
        for k, v in data.items():
            setattr(obj, k, v)
    else:
        obj = Product(**data)
        db.add(obj)


def import_csv(path: str):
    db = SessionLocal()
    try:
        with open(path, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                # skip empty lines
                if not any(row.values()):
                    continue
                data = row_to_product_kwargs(row)
                # skip if no name
                if not data["name"]:
                    continue
                upsert_product(db, data)
                count += 1
            db.commit()
            print(f"Imported/updated {count} products.")
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Import products CSV into database.")
    parser.add_argument("--csv", required=True, help="Path to CSV file")
    args = parser.parse_args()
    import_csv(args.csv)


if __name__ == "__main__":
    main()
