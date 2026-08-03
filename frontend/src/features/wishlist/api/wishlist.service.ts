import type { Wishlist } from '@/features/wishlist/types/wishlistTypes';
import { apiClient } from '@/lib/api/client';

const getWishlist = async (): Promise<Wishlist> => {
    const res = await apiClient.get('/wishlist');
    return res.data;
};

const addItem = async (productId: string): Promise<Wishlist> => {
    const res = await apiClient.post('/wishlist/items', { productId });
    return res.data;
};

const removeItem = async (productId: string): Promise<Wishlist> => {
    const res = await apiClient.delete(`/wishlist/items/${productId}`);
    return res.data;
};

export default { getWishlist, addItem, removeItem };
