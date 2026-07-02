import { memo } from 'react';

import type { OrderItem } from '../schemas/orderSchemas';
import { formatCurrency } from '../utils/orderStatus';

type OrderItemsCardProps = {
    items: OrderItem[];
    total: number | string;
};

/**
 * Detalle de líneas del pedido. Cada línea es un snapshot del producto al
 * comprar (nombre, SKU y precio congelados), así que se muestra tal cual sin
 * depender del catálogo actual.
 */
const OrderItemsCard = ({ items, total }: OrderItemsCardProps) => (
    <div className='border-border bg-surface flex flex-col rounded-2xl border'>
        <div className='flex items-center justify-between p-6 pb-4'>
            <h2 className='text-text font-display text-lg font-bold'>
                Artículos
            </h2>
            <span className='text-text-60 text-sm'>
                {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
            </span>
        </div>

        <ul className='divide-border divide-y'>
            {items.map(item => (
                <li
                    key={item.id}
                    className='flex items-center justify-between gap-4 px-6 py-4'
                >
                    <div className='flex min-w-0 flex-col'>
                        <span className='text-text truncate font-medium'>
                            {item.nameAtPurchase}
                        </span>
                        <span className='text-text-38 text-sm'>
                            {item.skuAtPurchase} · {item.quantity} ×{' '}
                            {formatCurrency(item.priceAtPurchase)}
                        </span>
                    </div>
                    <span className='text-text shrink-0 font-semibold'>
                        {formatCurrency(item.priceAtPurchase * item.quantity)}
                    </span>
                </li>
            ))}
        </ul>

        <div className='border-border flex items-center justify-between border-t px-6 py-5'>
            <span className='text-text font-display text-base font-bold'>
                Total
            </span>
            <span className='text-text font-display text-2xl font-extrabold'>
                {formatCurrency(total)}
            </span>
        </div>
    </div>
);

export default memo(OrderItemsCard);
