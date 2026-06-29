import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { queryClient } from '@/lib/queryClient';
import ordersService from '../api/orders.service';
import type { OrderSummary } from '../schemas/orderSchemas';
import { formatCurrency, formatOrderDate } from '../utils/orderStatus';
import OrderStatusBadge from './OrderStatusBadge';

type OrderRowProps = {
    order: OrderSummary;
};

/**
 * Fila de la lista de pedidos. Al mostrar intención (hover/focus) precarga el
 * detalle reutilizando la misma key/fetcher que `useGetOrderDetails`, de modo
 * que abrir el pedido es instantáneo (el `staleTime` global evita el refetch).
 */
const OrderRow = ({ order }: OrderRowProps) => {
    const navigate = useNavigate();

    const prefetchDetail = useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: ['order', 'detail', order.id],
            queryFn: () => ordersService.fetchOrder(order.id),
        });
    }, [order.id]);

    return (
        <button
            type='button'
            onClick={() => navigate(`/orders/${order.id}`)}
            onMouseEnter={prefetchDetail}
            onFocus={prefetchDetail}
            className='group border-border bg-surface hover:border-primary-20 flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-5'
        >
            <div className='flex min-w-0 flex-col'>
                <span className='font-display text-text text-base font-bold'>
                    Pedido #{order.orderNumber}
                </span>
                <span className='text-text-60 text-sm'>
                    {formatOrderDate(order.createdAt)}
                </span>
            </div>
            {order.user && (
                <div className='flex min-w-0 flex-col'>
                    <span className='font-display text-text truncate text-base font-bold'>
                        {order.user.name}
                    </span>
                    <span className='text-text-60 truncate text-sm'>
                        {order.user.email}
                    </span>
                </div>
            )}

            <div className='ml-auto flex items-center gap-3 sm:gap-5'>
                <span className='text-text font-display hidden text-lg font-bold sm:inline'>
                    {formatCurrency(order.totalAmount)}
                </span>
                <OrderStatusBadge status={order.status} />
                <svg
                    className='text-text-38 group-hover:text-primary size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    aria-hidden='true'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                    />
                </svg>
            </div>
        </button>
    );
};

// memo: la fila solo depende de su `order`. Evita re-render del listado completo
// cuando el padre se re-renderiza por causas ajenas.
export default memo(OrderRow);
