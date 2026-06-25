import z from 'zod';

export const CreateOrderSchema = z.object({
    shippingAddressId: z.uuid(),
    billingAddressId: z.uuid().optional(),
});

export const orderStatusValues = [
    'pending',
    'paid',
    'shipped',
    'delivered',
    'cancelled',
] as const;

export const OrderStatusSchema = z.object({
    status: z.enum(orderStatusValues),
});

export const OrderIdParamSchema = z.object({
    orderId: z.uuid(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type OrderStatus = (typeof orderStatusValues)[number];

export const OrdersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type OrdersQuery = z.infer<typeof OrdersQuerySchema>;
