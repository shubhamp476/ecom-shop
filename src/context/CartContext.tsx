"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { PRODUCTS } from "@/data/products";

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  addToCart: (
    product: {
      id?: string;
      _id?: string;
      name: string;
      slug?: string;
      sku?: string;
      price?: number;
      originalPrice?: number;
      image?: string;
    },
    quantity?: number
  ) => void;
  removeFromCart: (idOrSlug: string) => void;
  updateQuantity: (idOrSlug: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "givolt_cart_items_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load cart from localStorage", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save to localStorage whenever items change (after initial hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save cart to localStorage", e);
    }
  }, [items, hydrated]);

  const addToCart = (
    product: {
      id?: string;
      _id?: string;
      name: string;
      slug?: string;
      sku?: string;
      price?: number;
      originalPrice?: number;
      image?: string;
    },
    qty = 1
  ) => {
    const quantity = Math.max(1, qty);

    // Try finding matching product in static PRODUCTS catalog if fields are missing
    const catalogMatch =
      PRODUCTS.find((p) => p.name.toLowerCase() === product.name.toLowerCase()) ||
      PRODUCTS.find((p) => product.slug && p.slug === product.slug);

    const slug = product.slug || catalogMatch?.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const id = product.id || product._id || slug;
    const name = product.name || catalogMatch?.name || "Product";
    const price = product.price ?? catalogMatch?.price ?? 1999;
    const originalPrice = product.originalPrice ?? catalogMatch?.originalPrice;
    const image = product.image || catalogMatch?.image || "/assets/69d4a88b6ec9fb5582a36aeb_1.avif";
    const sku = product.sku || `GV-${slug.toUpperCase()}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === id || item.slug === slug);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id,
            name,
            slug,
            sku,
            price,
            originalPrice,
            image,
            quantity,
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (idOrSlug: string) => {
    setItems((prev) => prev.filter((item) => item.id !== idOrSlug && item.slug !== idOrSlug));
  };

  const updateQuantity = (idOrSlug: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(idOrSlug);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === idOrSlug || item.slug === idOrSlug ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

