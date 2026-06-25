import { useQuery } from '@tanstack/react-query';
import ordersService from '../api/orders.service';

export const useGetOrderDetails = (id: string) => {
    const query = useQuery({
        queryKey: ['order', 'detail', id],
        queryFn: () => ordersService.fetchOrder(id),
    });

    return {
        order: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
    };
};
