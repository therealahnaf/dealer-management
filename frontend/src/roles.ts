// src/roles.ts
export type UserRole = 'admin' | 'buyer';

export const homeForRole = (role?: UserRole | null) => {
  if (role === 'buyer') return '/products';
  return '/dashboard'; // default admin landing (adjust if different)
};
