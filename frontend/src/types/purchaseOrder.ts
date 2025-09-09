// frontend/src/types/purchaseOrder.ts

export interface ProductDetails {
  product_id: string;
  name: string;
  pack_size: string;
  trade_price_incl_vat: number;
  mrp: number;
  stock_qty: number;
  sku_code: string;
  status: string;
}

export interface PurchaseOrderItem {
  po_item_id: number;
  po_id: number;
  product_id: string;
  product: ProductDetails;  // Made required since we always expect product details
  pack_size_snapshot: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface DealerDetails {
  dealer_id: string;
  company_name: string;
  contact_person: string;
  contact_number: string;
  email?: string;
  billing_address: string;
  shipping_address: string;
  created_at: string;
  updated_at?: string;
}

export interface PurchaseOrder {
  po_id: number;
  po_number: string;
  dealer_id: string;
  dealer: DealerDetails;  // Always included in the response
  created_by_user: string;
  external_ref_code: string | null;
  po_date: string;
  status: 'draft' | 'submitted' | 'approved' | 'invoiced' | 'cancelled';
  total_ex_vat: number;
  vat_percent: number;
  vat_amount: number;
  total_inc_vat: number;
  approved_at: string | null;
  created_at: string;
  updated_at: string | null;
  items: PurchaseOrderItem[];  // Always included with product details
  combined_po_id: number | null;
}

export interface PurchaseOrderItemCreate {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface PurchaseOrderCreate {
  dealer_id: string;
  external_ref_code?: string;
  items: PurchaseOrderItemCreate[];
}
