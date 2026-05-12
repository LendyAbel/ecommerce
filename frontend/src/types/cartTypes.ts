import type { Product } from './productTypes';

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
