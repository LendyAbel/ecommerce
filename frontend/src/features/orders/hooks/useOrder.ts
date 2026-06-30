import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import type { CreateOrderInput } from '../schemas/orderSchemas';
import ordersService, { type OrdersFilters } from '../api/orders.service';
import { useAuthStore } from '@/features/auth';

const KEY = ['order'];
const PAGE_SIZE = 6;

export const useGetOrdersList = (filters: OrdersFilters = {}) => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    const query = useInfiniteQuery({
        queryKey: [...KEY, isAdmin ? 'all' : 'mine', filters],
        queryFn: ({ pageParam }) =>
            isAdmin
                ? ordersService.getAllOrders({
                      ...filters,
                      page: pageParam,
                      limit: PAGE_SIZE,
                  })
                : ordersService.getMyOrders({
                      ...filters,
                      page: pageParam,
                      limit: PAGE_SIZE,
                  }),
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
        queryKey: [...KEY, 'detail', id],
        queryFn: () => ordersService.fetchOrder(id),
    });

    return {
        order: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
    };
};

export const useCreateOrder = (data: CreateOrderInput) => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => ordersService.createOrder(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};
