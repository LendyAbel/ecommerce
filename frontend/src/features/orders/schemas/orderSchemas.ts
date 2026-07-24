import z from 'zod';

import {
    AddressFormSchema,
    AddressSchema,
} from '@/features/addresses/schemas/addressSchemas';

// --- Estados ---
export const orderStatusValues = [
    'pending',
    'paid',
    'shipped',
    'delivered',
    'cancelled',
] as const;
export const OrderStatusSchema = z.enum(orderStatusValues);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

// --- Línea de la orden (snapshot del producto al comprar) ---
export const OrderItemSchema = z.object({
    id: z.uuid(),
    skuAtPurchase: z.string(),
    nameAtPurchase: z.string(),
    priceAtPurchase: z.coerce.number(), // Decimal → string en JSON
    quantity: z.number().int(),
    productId: z.uuid().nullable(), // SetNull si se borra el producto
    orderId: z.uuid(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

// --- Usuario dueño de la orden (solo presente en el listado de admin) ---
export const OrderUserSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
});
export type OrderUser = z.infer<typeof OrderUserSchema>;

// --- Orden: campos base comunes a todas las respuestas ---
const orderBaseShape = {
    id: z.uuid(),
    orderNumber: z.int(),
    status: OrderStatusSchema,
    totalAmount: z.coerce.number(), // Decimal → string en JSON
    userId: z.uuid(),
    shippingAddressId: z.uuid().nullable(),
    billingAddressId: z.uuid().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
};

// Resumen: lo que devuelve el listado (sin items ni direcciones).
// `user` solo viene en el listado de admin (`/orders/all`).
export const OrderSummarySchema = z.object({
    ...orderBaseShape,
    user: OrderUserSchema.optional(),
});
export type OrderSummary = z.infer<typeof OrderSummarySchema>;

// Detalle: incluye los items y (al crear) las direcciones congeladas.
export const OrderSchema = z.object({
    ...orderBaseShape,
    orderItems: z.array(OrderItemSchema),
    shippingAddress: AddressSchema.nullable().optional(),
    billingAddress: AddressSchema.nullable().optional(),
    // Solo presente cuando un admin consulta el detalle.
    user: OrderUserSchema.optional(),
});
export type Order = z.infer<typeof OrderSchema>;

// Cada dirección llega como id de la libreta O como dirección inline (misma
// forma que `AddressFormSchema` de la libreta, no se guarda), no ambas.
// Si no se envían datos de facturación, el backend factura a la de envío.
export const CreateOrderSchema = z.object({
    shippingAddressId: z.uuid().optional(),
    shippingAddress: AddressFormSchema.optional(),
    billingAddressId: z.uuid().optional(),
    billingAddress: AddressFormSchema.optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export const PaginatedOrdersSchema = z.object({
    data: OrderSummarySchema.array(),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
});
export type PaginatedOrders = z.infer<typeof PaginatedOrdersSchema>;

export const OrdersFiltersSchema = z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
});
export type OrdersFilters = z.infer<typeof OrdersFiltersSchema>;

export const UpdateStatusInputSchema = z.object({
    orderId: z.string(),
    status: OrderStatusSchema,
});
export type UpdateStatusInput = z.infer<typeof UpdateStatusInputSchema>;
