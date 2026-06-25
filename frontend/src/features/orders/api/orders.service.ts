import { apiClient } from '@/lib/api/client';
import type { Order, OrderSummary } from '../schemas/orderSchemas';

const getMyOrders = async (): Promise<OrderSummary[]> => {
    const res = await apiClient.get('/orders');
    return res.data;
};

const getAllOrders = async (): Promise<OrderSummary[]> => {
    const res = await apiClient.get('/orders/all');
    return res.data;
};

const fetchOrder = async (orderId: string): Promise<Order> => {
    const res = await apiClient.get(`/orders/${orderId}`);
    return res.data;
};

export default { getMyOrders, getAllOrders, fetchOrder };
