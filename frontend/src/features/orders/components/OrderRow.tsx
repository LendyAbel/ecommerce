import { memo, useCallback } from 'react';
import { NavLink } from 'react-router';

import { prefetchOrderDetailQueryOptions } from '@/features/orders/api/orders.queries';
import type { OrderSummary } from '@/features/orders/schemas/orderSchemas';
import { queryClient } from '@/lib/queryClient';
import { formatCurrency, formatOrderDate } from '@/shared/utils/format';

import OrderStatusBadge from './OrderStatusBadge';

type OrderRowProps = {
    order: OrderSummary;
};

/**
 * Fila de la lista de pedidos. Al mostrar intención (hover/focus) precarga el
 * detalle reutilizando la misma key/fetcher que `useOrder`, de modo
 * que abrir el pedido es instantáneo (el `staleTime` global evita el refetch).
 */
const OrderRow = ({ order }: OrderRowProps) => {
    const prefetchDetail = useCallback(() => {
        queryClient.prefetchQuery(prefetchOrderDetailQueryOptions(order.id));
    }, [order.id]);

    return (
        <NavLink to={`/orders/${order.id}`}>
            <div
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
            </div>
        </NavLink>
    );
};

// memo: la fila solo depende de su `order`. Evita re-render del listado completo
// cuando el padre se re-renderiza por causas ajenas.
export default memo(OrderRow);
