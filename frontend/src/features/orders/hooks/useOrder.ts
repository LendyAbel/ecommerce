import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';
import {
    cancelOrderMutationOptions,
    createOrderMutationOptions,
    getOrderDetailsQueryOptions,
    getOrdersListQueryOptions,
    updateOrderStatusMutationOptions,
} from '@/features/orders/api/orders.queries';
import type { OrdersFilters } from '@/features/orders/schemas/orderSchemas';


export const useOrders = (filters: OrdersFilters = {}) => {
    const user = useAuthStore(state => state.user);
    const isAdmin = user?.role === 'admin';

    const query = useInfiniteQuery(
        getOrdersListQueryOptions(filters, isAdmin, !!user),
    );

    // Memoizado para no crear un array nuevo en cada render (consistencia con
    // `useProducts`; los hijos están memo-izados por item).
    const orders = useMemo(
        () => query.data?.pages.flatMap(page => page.data) ?? [],
        [query.data],
    );

    return {
        orders,
        isAdmin,
        isLoading: query.isLoading,
        isError: query.isError,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
        refetch: query.refetch
    };
};

export const useOrder = (
    id: string,
    { pollWhilePending = false }: { pollWhilePending?: boolean } = {},
) => {
    const user = useAuthStore(state => state.user);
    const isAdmin = user?.role === 'admin';

    const query = useQuery(
        getOrderDetailsQueryOptions(id, isAdmin, pollWhilePending),
    );

    return {
        order: query.data,
        isAdmin,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    };
};

export const useCreateOrder = () => {
    return useMutation(createOrderMutationOptions());
};

export const useCancelOrder = () => {
    return useMutation(cancelOrderMutationOptions());
};

export const useUpdateOrderStatus = () => {
    return useMutation(updateOrderStatusMutationOptions());
};