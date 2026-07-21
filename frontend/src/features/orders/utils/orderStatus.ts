import type { OrderStatus } from '@/features/orders/schemas/orderSchemas';
import type { BadgeVariant } from '@/shared/ui/Badge';

/**
 * Configuración visual de cada estado de pedido: etiqueta en español y la
 * variante de `Badge` que le corresponde en el design system. Centralizar esto
 * evita repetir el mapeo en cada componente que muestre un estado.
 */
export const ORDER_STATUS_CONFIG: Record<
    OrderStatus,
    { label: string; badge: BadgeVariant }
> = {
    pending: { label: 'Pendiente', badge: 'warning' },
    paid: { label: 'Pagado', badge: 'primary' },
    shipped: { label: 'Enviado', badge: 'new' },
    delivered: { label: 'Entregado', badge: 'success' },
    cancelled: { label: 'Cancelado', badge: 'error' },
};

/**
 * Secuencia de cumplimiento de un pedido. `cancelled` queda fuera porque es un
 * estado terminal que rompe el flujo (se muestra aparte en la línea de tiempo).
 */
export const ORDER_FLOW: readonly OrderStatus[] = [
    'pending',
    'paid',
    'shipped',
    'delivered',
];

