import {
    infiniteQueryOptions,
    mutationOptions,
    queryOptions,
} from '@tanstack/react-query';

import { useCartStore } from '@/features/cart/store/cartStore';
import { queryClient } from '@/lib/queryClient';

import type {
    CreateOrderInput,
    OrdersFilters,
    OrderStatus,
} from '../schemas/orderSchemas';
import ordersService from './orders.service';

const PAGE_SIZE = 6;

export const orderKeys = {
    all: ['order'] as const,
    list: (isAdmin: boolean, filters: OrdersFilters) =>
        [...orderKeys.all, isAdmin ? 'all' : 'mine', filters] as const,
    detail: (id: string, isAdmin = false) =>
        [...orderKeys.all, 'detail', id, isAdmin] as const,

    create: () => [...orderKeys.all, 'create'] as const,
    cancel: () => [...orderKeys.all, 'cancel'] as const,
    updateStatus: () => [...orderKeys.all, 'update-status'] as const,
};

export const getOrdersListQueryOptions = (
    filters: OrdersFilters,
    isAdmin: boolean,
    enabled: boolean,
) =>
    infiniteQueryOptions({
        queryKey: orderKeys.list(isAdmin, filters),
        queryFn: ({ pageParam }) =>
            ordersService.getOrders(
                { ...filters, page: pageParam, limit: PAGE_SIZE },
                isAdmin,
            ),
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            const loaded = lastPage.page * lastPage.limit;
            return loaded < lastPage.total ? lastPage.page + 1 : undefined;
        },
        enabled,
    });

export const getprefetchQueryOptions = (id: string) =>
    queryOptions({
        queryKey: orderKeys.detail(id),
        queryFn: () => ordersService.getOrderById(id),
    });

export const getOrderDetailsQueryOptions = (
    id: string,
    isAdmin: boolean,
    pollWhilePending: boolean,
) =>
    queryOptions({
        queryKey: orderKeys.detail(id, isAdmin),
        queryFn: () => ordersService.getOrderById(id),
        enabled: !!id,
        // Tras volver de Stripe el webhook puede tardar en marcar la orden como
        // pagada; se reconsulta cada 2s mientras siga 'pending' y se detiene sola.
        refetchInterval: pollWhilePending
            ? query => (query.state.data?.status === 'pending' ? 2000 : false)
            : undefined,
    });

export const createOrderMutationOptions = () =>
    mutationOptions({
        mutationKey: orderKeys.create(),
        mutationFn: (data: CreateOrderInput) => ordersService.createOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            // Vacía el carrito (estado en memoria + localStorage vía persist).
            useCartStore.getState().clearCart();
        },
    });

export const cancelOrderMutationOptions = () =>
    mutationOptions({
        mutationKey: orderKeys.cancel(),
        mutationFn: (orderId: string) => ordersService.cancelOrder(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });

export const updateOrderStatusMutationOptions = () =>
    mutationOptions({
        mutationKey: orderKeys.updateStatus(),
        mutationFn: ({
            orderId,
            status,
        }: {
            orderId: string;
            status: OrderStatus;
        }) => ordersService.updateOrderStatus({ orderId, status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
