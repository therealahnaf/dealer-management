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