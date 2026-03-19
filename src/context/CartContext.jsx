'use client';

import { createContext, Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const CART_STORAGE_KEY = 'kifayatly_cart_v2';
const CartContext = createContext(null);

function getCartItemId(item) {
  return item?.slug || item?._id || item?.id || item?.productId || item?.Name || item?.name;
}

function normalizeCartItem(item) {
  return {
    id: getCartItemId(item),
    slug: item.slug || item.id || item._id || '',
    _id: item._id || item.id || item.slug || '',
    Name: item.Name || item.name || 'Untitled Product',
    Price: Number(item.Price || item.price || 0),
    discountedPrice: item.discountedPrice != null ? Number(item.discountedPrice) : null,
    Category: Array.isArray(item.Category) ? item.Category : item.Category ? [item.Category] : [],
    Images: item.Images || [],
    quantity: Math.max(1, Number(item.quantity || 1)),
  };
}

function CartProviderContent({ children }) {
  const [state, setState] = useState({
    cart: [],
    isInitialized: false,
    activeCategory: 'all',
    isCartOpen: false,
    isSidebarOpen: false,
  });

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        const cart = Array.isArray(parsed?.items) ? parsed.items.map(normalizeCartItem) : [];
        setState((current) => ({ ...current, cart, isInitialized: true }));
        return;
      }
    } catch (error) {
      console.error('Failed to parse cart from local storage', error);
    }

    setState((current) => ({ ...current, isInitialized: true }));
  }, []);

  useEffect(() => {
    if (!state.isInitialized) return;
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 2,
        items: state.cart,
      }),
    );
  }, [state.cart, state.isInitialized]);

  const actions = useMemo(
    () => ({
      setActiveCategory(value) {
        setState((current) => ({ ...current, activeCategory: value }));
      },
      setIsCartOpen(value) {
        setState((current) => ({ ...current, isCartOpen: value }));
      },
      setIsSidebarOpen(value) {
        setState((current) => ({ ...current, isSidebarOpen: value }));
      },
      openCart() {
        setState((current) => ({ ...current, isSidebarOpen: false, isCartOpen: true }));
      },
      openSidebar() {
        setState((current) => ({ ...current, isCartOpen: false, isSidebarOpen: true }));
      },
      addToCart(product, qtyToAdd = 1) {
        const normalized = normalizeCartItem({ ...product, quantity: qtyToAdd });
        setState((current) => {
          const existingIndex = current.cart.findIndex((item) => item.id === normalized.id);
          if (existingIndex > -1) {
            const nextCart = [...current.cart];
            nextCart[existingIndex] = {
              ...nextCart[existingIndex],
              quantity: nextCart[existingIndex].quantity + normalized.quantity,
            };
            return { ...current, cart: nextCart };
          }

          return {
            ...current,
            cart: [...current.cart, normalized],
          };
        });

        toast.success(`${normalized.Name} added to cart`, {
          duration: 3000,
          action: {
            label: 'View Cart',
            onClick: () =>
              setState((current) => ({ ...current, isSidebarOpen: false, isCartOpen: true })),
          },
        });
      },
      removeFromCart(product) {
        const itemId = getCartItemId(product);
        setState((current) => ({
          ...current,
          cart: current.cart.filter((item) => item.id !== itemId),
        }));
      },
      updateQuantity(product, newQuantity) {
        const itemId = getCartItemId(product);
        const safeQuantity = Math.max(0, Number(newQuantity) || 0);

        if (safeQuantity < 1) {
          setState((current) => ({
            ...current,
            cart: current.cart.filter((item) => item.id !== itemId),
          }));
          return;
        }

        setState((current) => ({
          ...current,
          cart: current.cart.map((item) =>
            item.id === itemId ? { ...item, quantity: safeQuantity } : item,
          ),
        }));
      },
      clearCart() {
        setState((current) => ({ ...current, cart: [] }));
      },
    }),
    [],
  );

  const value = useMemo(
    () => ({
      state,
      actions,
      meta: {
        cartCount: state.cart.reduce((total, item) => total + item.quantity, 0),
      },
      cart: state.cart,
      cartCount: state.cart.reduce((total, item) => total + item.quantity, 0),
      isInitialized: state.isInitialized,
      activeCategory: state.activeCategory,
      isCartOpen: state.isCartOpen,
      isSidebarOpen: state.isSidebarOpen,
      ...actions,
    }),
    [actions, state],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function CartProvider({ children }) {
  return (
    <Suspense fallback={null}>
      <CartProviderContent>{children}</CartProviderContent>
    </Suspense>
  );
}

export function useCart() {
  return useContext(CartContext);
}
