import axios from 'axios';
import type { Cart } from '../types/cartTypes';

const api = axios.create({
    baseURL: '/api/cart',
    withCredentials: true,
});

const getCart = async (): Promise<Cart> => {
    const res = await api.get('/');
    return res.data;
};

const addItem = async (productId: string, quantity: number = 1): Promise<Cart> => {
    const res = await api.post('/items', { productId, quantity });
    return res.data;
};

const updateItem = async (itemId: string, quantity: number): Promise<Cart> => {
    const res = await api.patch(`/items/${itemId}`, { quantity });
    return res.data;
};

const removeItem = async (itemId: string): Promise<Cart> => {
    const res = await api.delete(`/items/${itemId}`);
    return res.data;
};

const clearCart = async (): Promise<Cart> => {
    const res = await api.delete('/');
    return res.data;
};

export default { getCart, addItem, updateItem, removeItem, clearCart };
