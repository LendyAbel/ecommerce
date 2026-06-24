import z from 'zod';
import { OrderStatus } from '../../../../generated/prisma/enums';

export const CreateOrderSchema = z.object({
    shippingAddressId: z.uuid(),
    billingAddressId: z.uuid().optional()
})

export const UpdateOrderStatusSchema = z.object({
    status: z.enum(OrderStatus)
})

export const OrderIdParamSchema = z.object({
    orderId: z.uuid(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>