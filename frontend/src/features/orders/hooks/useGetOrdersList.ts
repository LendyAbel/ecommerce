import { useQuery } from '@tanstack/react-query';
import ordersService from '../api/orders.service';
import { useAuthStore } from '@/features/auth';

export const useGetOrdersList = () => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';

    const query = useQuery({
        queryKey: ['orders', isAdmin ? 'all' : 'mine'],
        queryFn: isAdmin
            ? ordersService.getAllOrders
            : ordersService.getMyOrders,
        enabled: !!user,
    });

    const orders = query.data ?? [];

    return {
        orders,
        isAdmin,
        isLoading: query.isLoading,
        isError: query.isError,
    };
};
