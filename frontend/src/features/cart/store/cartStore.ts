import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LocalCart, LocalCartItem } from '@/features/cart/types/cartTypes';

type CartStore = {
    cart: LocalCart;

    addItem: (
        item: Omit<LocalCartItem, 'quantity'> & { quantity?: number },
    ) => boolean;
    removeItem: (productId: string) => void;
    updateItem: (productId: string, quantity: number) => boolean;
    clearCart: () => void;
    setCartItems: (cartItems: LocalCartItem[]) => void;

    totalItems: () => number;
    totalPrice: () => number;
};

const EMPTY_CART = { cartItems: [] };

const hasEnoughStock = (desiredQuantity: number, stock: number) =>
    desiredQuantity <= stock;

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            cart: EMPTY_CART,

            addItem: ({ product, quantity = 1 }) => {
                const existingItem = get().cart.cartItems.find(
                    item => item.product.id === product.id,
                );
                const desiredQuantity =
                    (existingItem?.quantity ?? 0) + quantity;

                if (!hasEnoughStock(desiredQuantity, product.stock ?? 0)) {
                    return false;
                }

                set(state => {
                    let newItems: LocalCartItem[];

                    if (existingItem) {
                        newItems = state.cart.cartItems.map(item =>
                            item.product.id === product.id
                                ? {
                                      ...item,
                                      quantity: item.quantity + quantity,
                                  }
                                : item,
                        );
                    } else {
                        newItems = [
                            ...state.cart.cartItems,
                            { product, quantity },
                        ];
                    }
                    return { cart: { cartItems: newItems } };
                });

                return true;
            },

            removeItem: productId => {
                set(state => ({
                    cart: {
                        cartItems: state.cart.cartItems.filter(
                            item => item.product.id !== productId,
                        ),
                    },
                }));
            },

            updateItem: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return true;
                }

                const item = get().cart.cartItems.find(
                    item => item.product.id === productId,
                );

                if (
                    item &&
                    !hasEnoughStock(quantity, item.product.stock ?? 0)
                ) {
                    return false;
                }

                set(state => ({
                    cart: {
                        cartItems: state.cart.cartItems.map(item =>
                            item.product.id === productId
                                ? { ...item, quantity }
                                : item,
                        ),
                    },
                }));

                return true;
            },

            clearCart: () => {
                set({ cart: EMPTY_CART });
            },

            setCartItems: cartItems => set({ cart: { cartItems } }),

            totalItems: () =>
                get().cart.cartItems.reduce(
                    (acc, item) => acc + item.quantity,
                    0,
                ),

            totalPrice: () =>
                get().cart.cartItems.reduce(
                    (acc, item) => acc + item.product.price * item.quantity,
                    0,
                ),
        }),
        {
            name: 'shopping-cart',
            version: 1,
            // Pass-through: conserva el carrito ya guardado (sin versión = v0).
            migrate: persisted => persisted as Pick<CartStore, 'cart'>,
            storage: createJSONStorage(() => localStorage),
            partialize: state => ({ cart: state.cart }),
        },
    ),
);
