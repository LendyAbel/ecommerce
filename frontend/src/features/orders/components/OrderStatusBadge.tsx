import { memo } from 'react';

import type { OrderStatus } from '@/features/orders/schemas/orderSchemas';
import { ORDER_STATUS_CONFIG } from '@/features/orders/utils/orderStatus';
import { Badge } from '@/shared/ui';

type OrderStatusBadgeProps = {
    status: OrderStatus;
};

/**
 * Píldora de estado del pedido. Traduce el `status` del backend a su etiqueta y
 * color del design system mediante `ORDER_STATUS_CONFIG`.
 */
const OrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
    const { label, badge } = ORDER_STATUS_CONFIG[status];
    return <Badge variant={badge}>{label}</Badge>;
};

export default memo(OrderStatusBadge);
