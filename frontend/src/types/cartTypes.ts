import type { Product } from './productTypes';

export type CartItem = {
    product: Product;
    quantity: number;
};
