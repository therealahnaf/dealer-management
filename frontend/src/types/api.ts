// API Types based on FastAPI schemas
export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
  contact_number?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRead {
  user_id: string;
  email: string;
  full_name?: string;
  role?: UserRole;
  contact_number?: string;
  status?: UserStatus;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface PasswordReset {
  email: string;
  new_password: string;
  confirm_new_password: string;
}

export interface DealerCreate {
  customer_code: string;
  company_name: string;
  contact_person?: string;
  contact_number?: string;
  billing_address?: string;
  shipping_address?: string;
}

export interface DealerUpdate {
  customer_code?: string;
  company_name?: string;
  contact_person?: string;
  contact_number?: string;
  billing_address?: string;
  shipping_address?: string;
}

export interface DealerBase {
  customer_code?: string;
  company_name?: string;
  contact_person?: string;
  contact_number?: string;
  billing_address?: string;
  shipping_address?: string;
}

export enum UserRole {
  BUYER = 'buyer',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface ApiError {
  detail: string;
}

export enum ProductStatus {
  ACTIVE = "active",
  DISCONTINUED = "discontinued",
}

export interface ProductRead {
  product_id: string;
  sku_code: string;
  name: string;
  pack_size?: string;
  product_list_tag?: string;
  mrp: number;
  trade_price_incl_vat: number;
  retailer_profit: number;
  stock_qty: number;
  status: ProductStatus;
  created_at: string; // Assuming ISO date string
  updated_at?: string; // Assuming ISO date string
}