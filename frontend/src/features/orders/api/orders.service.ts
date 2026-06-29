import { apiClient } from '@/lib/api/client';
import type {
    CreateOrderInput,
    Order,
    OrderSummary,
} from '../schemas/orderSchemas';

export type OrdersFilters = {
    page?: number;
    limit?: number;
};

export type PaginatedOrders = {
    data: OrderSummary[];
    total: number;
    page: number;
    limit: number;
};

const getMyOrders = async (
    filters: OrdersFilters,
): Promise<PaginatedOrders> => {
    const params: Record<string, string> = {};

    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);

    const res = await apiClient.get('/orders', { params });
    return res.data;
};

const getAllOrders = async (
    filters: OrdersFilters,
): Promise<PaginatedOrders> => {
    const params: Record<string, string> = {};

    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);

    const res = await apiClient.get('/orders/all', { params });
    return res.data;
};

const fetchOrder = async (orderId: string): Promise<Order> => {
    const res = await apiClient.get(`/orders/${orderId}`);
    return res.data;
};

const createOrder = async (data: CreateOrderInput): Promise<Order> => {
    const res = await apiClient.post('/orders', data);
    return res.data;
};

export default { getMyOrders, getAllOrders, fetchOrder, createOrder };
