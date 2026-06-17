import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LocalCart, LocalCartItem } from '@/features/cart/types/cartTypes';
import { notify } from '@/shared/store/alertStore';

type CartStore = {
    cart: LocalCart;

    addItem: (
        item: Omit<LocalCartItem, 'quantity'> & { quantity?: number },
    ) => void;
    removeItem: (productId: string) => void;
    updateItem: (productId: string, quantity: number) => void;
    clearCart: () => void;
    setCartItems: (cartItems: LocalCartItem[]) => void;

    totalItems: () => number;
    totalPrice: () => number;
};

const EMPTY_CART = { cartItems: [] };

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            cart: EMPTY_CART,

            addItem: ({ product, quantity = 1 }) => {
                set(state => {
                    const existingItem = state.cart.cartItems.find(
                        item => item.product.id === product.id,
                    );

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
                notify.success('Producto añadido al carrito')
            },
            removeItem: productId => {
                set(state => ({
                    cart: {
                        cartItems: state.cart.cartItems.filter(
                            item => item.product.id !== productId,
                        ),
                    },
                }));
                notify.warning('Prducto eliminado del carrito')
            },
            updateItem: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
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
            },
            clearCart: () => {
                set({ cart: EMPTY_CART })
                notify.warning('Carrito vaciado')
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
            storage: createJSONStorage(() => localStorage),
            partialize: state => ({ cart: state.cart }),
        },
    ),
);
