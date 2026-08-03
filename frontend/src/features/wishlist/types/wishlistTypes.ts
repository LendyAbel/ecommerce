import type { Product } from '@/features/products/schemas/productSchemas';

export type WishItem = {
    id: string;
    productId: string;
    wishlistId: string;
    product: Product;
};

export type Wishlist = {
    id: string;
    userId: string;
    wishItems: WishItem[];
    createdAt: string;
};
