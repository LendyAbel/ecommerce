import type { Product } from '@/features/products/types/productTypes';

export type LocalCartItem = {
    id?: string
    quantity: number;
    product: Product;
};

export type LocalCart = {
    cartItems: LocalCartItem[];
};

export type CartItem = {
    id: string;
    quantity: number;
    productId: string;
    cartId: string;
    product: Product;
};

export type Cart = {
    id: string;
    userId: string;
    cartItems: CartItem[];
    createdAt: string;
    updatedAt: string;
};
