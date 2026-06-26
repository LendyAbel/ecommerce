import { apiClient } from '@/lib/api/client';
import type { Cart } from '@/features/cart/types/cartTypes';

const getCart = async (): Promise<Cart> => {
    const res = await apiClient.get('/cart');
    return res.data;
};

const addItem = async (
    productId: string,
    quantity: number = 1,
): Promise<Cart> => {
    const res = await apiClient.post('/cart/items', { productId, quantity });
    return res.data;
};

const updateItem = async (itemId: string, quantity: number): Promise<Cart> => {
    const res = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
    return res.data;
};

const removeItem = async (itemId: string): Promise<Cart> => {
    const res = await apiClient.delete(`/cart/items/${itemId}`);
    return res.data;
};

const clearCart = async (): Promise<Cart> => {
    const res = await apiClient.delete('/cart');
    return res.data;
};

export default { getCart, addItem, updateItem, removeItem, clearCart };
