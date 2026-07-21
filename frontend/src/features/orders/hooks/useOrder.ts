import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth';

import {
    cancelOrderMutationOptions,
    createOrderMutationOptions,
    getOrderDetailsQueryOptions,
    getOrdersListQueryOptions,
    updateOrderStatusMutationOptions,
} from '../api/orders.queries';
import type { OrdersFilters } from '../schemas/orderSchemas';


export const useGetOrdersList = (filters: OrdersFilters = {}) => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    const query = useInfiniteQuery(
        getOrdersListQueryOptions(filters, isAdmin, !!user),
    );

    const orders = query.data?.pages.flatMap(page => page.data) ?? [];

    return {
        orders,
        isAdmin,
        isLoading: query.isLoading,
        isError: query.isError,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
    };
};

export const useGetOrderDetails = (
    id: string,
    { pollWhilePending = false }: { pollWhilePending?: boolean } = {},
) => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    const query = useQuery(
        getOrderDetailsQueryOptions(id, isAdmin, pollWhilePending),
    );

    return {
        order: query.data,
        isAdmin,
        isLoading: query.isLoading,
        isError: query.isError,
    };
};

export const useCreateOrder = () => {
    return useMutation(createOrderMutationOptions());
};

export const useCancelOrder = () => {
    return useMutation(cancelOrderMutationOptions());
};

export const useUpdateStatusOrder = () => {
    return useMutation(updateOrderStatusMutationOptions());
};
