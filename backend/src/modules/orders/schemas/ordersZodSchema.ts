import z from 'zod';

export const CreateOrderSchema = z.object({
    shippingAddressId: z.uuid(),
    billingAddressId: z.uuid().optional()
})

export const orderStatusValues = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const

export const OrderStatusSchema = z.object({
    status: z.enum(orderStatusValues)
})

export const OrderIdParamSchema = z.object({
    orderId: z.uuid(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type OrderStatus = (typeof orderStatusValues)[number]