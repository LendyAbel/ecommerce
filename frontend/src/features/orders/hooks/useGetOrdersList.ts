import { useInfiniteQuery } from '@tanstack/react-query';
import ordersService, { type OrdersFilters } from '../api/orders.service';
import { useAuthStore } from '@/features/auth';

const PAGE_SIZE = 6;

export const useGetOrdersList = (filters: OrdersFilters = {}) => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    const query = useInfiniteQuery({
        queryKey: ['orders', isAdmin ? 'all' : 'mine', filters],
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
        isFetchingNextPage: query.isFetchingNextPage
    };
};
