// frontend/src/contexts/CartContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { PurchaseOrderItemCreate } from '../types/purchaseOrder';

interface CartItem extends PurchaseOrderItemCreate {
  name: string; // Add product name for display purposes
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.product_id === item.product_id);
      if (existingItem) {
        // If item exists, update its quantity
        return prevItems.map(i =>
          i.product_id === item.product_id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        // Otherwise, add the new item
        return [...prevItems, item];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
