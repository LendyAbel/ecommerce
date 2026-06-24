import z from 'zod';

export const CreateOrderSchema = z.object({
    shippingAddressId: z.uuid(),
    billingAddressId: z.uuid()
})



export type CreateOrderInput = z.infer<typeof CreateOrderSchema>