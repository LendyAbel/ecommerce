import { apiClient } from '@/lib/api/client';

import type {
    CreateOrderInput,
    Order,
    OrderStatus,
    OrderSummary,
} from '../schemas/orderSchemas';

const BASE_ENPOINT = '/orders';

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

type UpdateStatusInput = {
    orderId: string;
    status: OrderStatus;
};

const getOrders = async (
    filters: OrdersFilters,
    isAdmin = false,
): Promise<PaginatedOrders> => {
    const params: Record<string, string> = {};

    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);

    const endpoint = isAdmin ? `${BASE_ENPOINT}/all` : BASE_ENPOINT;
    const res = await apiClient.get(endpoint, { params });
    return res.data;
};

const fetchOrder = async (orderId: string): Promise<Order> => {
    const res = await apiClient.get(`${BASE_ENPOINT}/${orderId}`);
    return res.data;
};

const createOrder = async (data: CreateOrderInput): Promise<Order> => {
    const res = await apiClient.post(BASE_ENPOINT, data);
    return res.data;
};

const cancelOrder = async (orderId: string): Promise<Order> => {
    const res = await apiClient.patch(`${BASE_ENPOINT}/${orderId}/cancel`);
    return res.data;
};

const updateOrderStatus = async ({
    orderId,
    status,
}: UpdateStatusInput): Promise<Order> => {
    const res = await apiClient.patch(`${BASE_ENPOINT}/${orderId}/status`, {
        status,
    });
    return res.data;
};

export default {
    getOrders,
    fetchOrder,
    createOrder,
    cancelOrder,
    updateOrderStatus,
};
