"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  type: "product" | "promotion";
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  stock?: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "cantidad"> & { cantidad?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, cantidad: i.cantidad + (item.cantidad ?? 1) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, cantidad: item.cantidad ?? 1 }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },

      updateQuantity: (id, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, cantidad } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      total: () =>
        get().items.reduce((sum, item) => sum + item.precio * item.cantidad, 0),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.cantidad, 0),
    }),
    {
      name: "chimi-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
