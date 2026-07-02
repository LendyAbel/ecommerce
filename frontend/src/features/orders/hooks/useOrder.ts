import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth';
import { useCartStore } from '@/features/cart/store/cartStore';

import ordersService, { type OrdersFilters } from '../api/orders.service';
import type { CreateOrderInput, OrderStatus } from '../schemas/orderSchemas';

const ORDER_KEY = ['order'];

const PAGE_SIZE = 6;

export const useGetOrdersList = (filters: OrdersFilters = {}) => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    const query = useInfiniteQuery({
        queryKey: [...ORDER_KEY, isAdmin ? 'all' : 'mine', filters],
        queryFn: ({ pageParam }) =>
            ordersService.getOrders(
                {
                    ...filters,
                    page: pageParam,
                    limit: PAGE_SIZE,
                },
                isAdmin,
            ),
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            const loaded = lastPage.page * lastPage.limit;
            return loaded < lastPage.total ? lastPage.page + 1 : undefined;
        },
        enabled: !!user,
    });

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

export const useGetOrderDetails = (id: string) => {
    const query = useQuery({
        queryKey: [...ORDER_KEY, 'detail', id],
        queryFn: () => ordersService.fetchOrder(id),
        enabled: !!id,
    });

    return {
        order: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
    };
};

export const useCreateOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateOrderInput) => ordersService.createOrder(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ORDER_KEY });
            // Vacía el carrito (estado en memoria + localStorage vía persist).
            useCartStore.getState().clearCart();
        },
    });
};

export const useCancelOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (orderId: string) => ordersService.cancelOrder(orderId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ORDER_KEY });
        },
    });
};

export const useUpdateStatusOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            orderId,
            status,
        }: {
            orderId: string;
            status: OrderStatus;
        }) => ordersService.updateOrderStatus({ orderId, status }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ORDER_KEY });
        },
    });
};
