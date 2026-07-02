import { memo } from 'react';

import type { Address } from '../schemas/orderSchemas';

type OrderAddressCardProps = {
    title: string;
    address: Address;
};

/**
 * Copia congelada de una dirección (envío o facturación) tal como quedó al
 * crear el pedido. Solo renderiza los campos opcionales que existan.
 */
const OrderAddressCard = ({ title, address }: OrderAddressCardProps) => (
    <div className='border-border bg-surface flex flex-col gap-1 rounded-2xl border p-5'>
        <span className='text-text-38 text-xs font-semibold tracking-wide uppercase'>
            {title}
        </span>
        <p className='text-text font-semibold'>{address.fullName}</p>
        <address className='text-text-60 text-sm not-italic'>
            {address.line1}
            {address.line2 && <>, {address.line2}</>}
            <br />
            {address.postalCode} {address.city}
            {address.state && <>, {address.state}</>}
            <br />
            {address.country}
        </address>
        {address.phone && (
            <p className='text-text-60 mt-1 text-sm'>Tel. {address.phone}</p>
        )}
    </div>
);

export default memo(OrderAddressCard);
