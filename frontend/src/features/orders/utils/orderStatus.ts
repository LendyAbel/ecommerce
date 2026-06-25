import type { OrderStatus } from '../schemas/orderSchemas';

type BadgeVariant = 'warning' | 'primary' | 'new' | 'success' | 'error';

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

// Formatters creados una sola vez a nivel de módulo (no por render). Construir
// un Intl.* en cada llamada es caro y aquí el formato no depende de la petición.
const currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

export const formatCurrency = (value: number | string) =>
    currencyFormatter.format(Number(value));

export const formatOrderDate = (value: string | Date) =>
    dateFormatter.format(new Date(value));

export const formatOrderDateTime = (value: string | Date) =>
    dateTimeFormatter.format(new Date(value));
