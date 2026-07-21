import {
    type CreateOrderInput,
    type Order,
    OrderSchema,
    type OrdersFilters,
    type PaginatedOrders,
    PaginatedOrdersSchema,
    type UpdateStatusInput,
} from '@/features/orders/schemas/orderSchemas';
import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/validateResponse';

const BASE_ENDPOINT = '/orders';

const getOrders = async (
    filters: OrdersFilters,
    isAdmin = false,
): Promise<PaginatedOrders> => {
    const params: Record<string, string> = {};

    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);

    const endpoint = isAdmin ? `${BASE_ENDPOINT}/all` : BASE_ENDPOINT;
    const res = await apiClient.get(endpoint, { params });
    return validateResponse(PaginatedOrdersSchema, res.data, 'GET /orders/all');
};

const getOrderById = async (orderId: string): Promise<Order> => {
    const res = await apiClient.get(`${BASE_ENDPOINT}/${orderId}`);
    return validateResponse(OrderSchema, res.data, `GET /orders/${orderId}`);
};

const createOrder = async (data: CreateOrderInput): Promise<Order> => {
    const res = await apiClient.post(BASE_ENDPOINT, data);
    return validateResponse(OrderSchema, res.data, 'POST /orders/');
};

const cancelOrder = async (orderId: string): Promise<Order> => {
    const res = await apiClient.patch(`${BASE_ENDPOINT}/${orderId}/cancel`);
    return validateResponse(
        OrderSchema,
        res.data,
        `PATCH /orders/${orderId}/cancel`,
    );
};

const updateOrderStatus = async ({
    orderId,
    status,
}: UpdateStatusInput): Promise<Order> => {
    const res = await apiClient.patch(`${BASE_ENDPOINT}/${orderId}/status`, {
        status,
    });
    return validateResponse(
        OrderSchema,
        res.data,
        `GET /orders/${orderId}/status`,
    );
};

export default {
    getOrders,
    getOrderById,
    createOrder,
    cancelOrder,
    updateOrderStatus,
};
