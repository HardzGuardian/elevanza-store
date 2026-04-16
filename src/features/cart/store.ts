'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  category: string;
  size?: string; // New field
}

interface CartStore {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (id: number, size?: string) => void;
  updateQuantity: (id: number, quantity: number, size?: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const currentItems = get().items;
        // Check for same ID AND same SIZE
        const existingItem = currentItems.find((item) => 
          item.id === product.id && item.size === product.size
        );

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === product.id && item.size === product.size
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...product, quantity: product.quantity || 1 }] });
        }
      },

      removeItem: (id, size) => {
        set({
          items: get().items.filter((item) => 
            !(item.id === id && item.size === size)
          ),
        });
      },

      updateQuantity: (id, quantity, size) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.id === id && item.size === size ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),

      totalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
    }),
    {
      name: 'fashion-shop-cart',
    }
  )
);
