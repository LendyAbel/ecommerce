import { create } from 'zustand';
import type { Cart } from '../types/cartTypes';
import cartService from '../services/cart.service';

type CartStore = {
    cart: Cart | null;
    isLoading: boolean;
    fetchCart: () => Promise<void>;
    addItem: (productId: string, quantity?: number) => Promise<void>;
    updateItem: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    reset: () => void;
    totalItems: () => number;
    totalPrice: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
    cart: null,
    isLoading: false,
    fetchCart: async () => {
        try {
            set({ isLoading: true });
            const cart = await cartService.getCart();
            set({ cart });
        } catch {
            set({ cart: null });
        } finally {
            set({ isLoading: false });
        }
    },
    addItem: async (productId, quantity = 1) => {
        set({ isLoading: true });
        try {
            const cart = await cartService.addItem(productId, quantity);
            set({ cart });
        } finally {
            set({ isLoading: false });
        }
    },
    updateItem: async (itemId, quantity) => {
        set({ isLoading: true });
        try {
            const cart = await cartService.updateItem(itemId, quantity);
            set({ cart });
        } finally {
            set({ isLoading: false });
        }
    },
    removeItem: async (itemId) => {
        set({ isLoading: true });
        try {
            const cart = await cartService.removeItem(itemId);
            set({ cart });
        } finally {
            set({ isLoading: false });
        }
    },
    clearCart: async () => {
        set({ isLoading: true });
        try {
            const cart = await cartService.clearCart();
            set({ cart });
        } finally {
            set({ isLoading: false });
        }
    },
    reset: () => set({ cart: null }),
    totalItems: () =>
        get().cart?.cartItems.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
    totalPrice: () =>
        get().cart?.cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0) ?? 0,
}));
