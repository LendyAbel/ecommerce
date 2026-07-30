import z from 'zod';

// Direccion del modelo de Prisma de la base de datos, un vez se crea en la
// libret de direcciones del usuario
export const AddressSchema = z.object({
    fullName: z.string(),
    phone: z.string().nullable(),
    line1: z.string(),
    line2: z.string().nullable(),
    city: z.string(),
    state: z.string().nullable(),
    postalCode: z.string(),
    country: z.string(),
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    userId: z.string().nullable(),
});

export type Address = z.infer<typeof AddressSchema>;

// Dirección escrita "en el momento" durante el checkout. No vive en la libreta
// del usuario: se congela tal cual en la orden
export const AddressInputSchema = z.object({
    fullName: z.string().min(1),
    phone: z.string().optional(),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().min(1),
});
export type AddressInput = z.infer<typeof AddressInputSchema>;

// Cada dirección de envío y facturación llega como una referencia que ya
// existe en la libreta de direcciones (`...Id`) o como una dirección inline
// de un solo uso (`...Address`), nunca ambas.
export const CreateOrderSchema = z
    .object({
        shippingAddressId: z.uuid().optional(),
        shippingAddress: AddressInputSchema.optional(),
        billingAddressId: z.uuid().optional(),
        billingAddress: AddressInputSchema.optional(),
    })
    .refine(d => !!d.shippingAddressId !== !!d.shippingAddress, {
        message:
            'Provide either shippingAddressId or shippingAddress, not both',
        path: ['shippingAddress'],
    })
    .refine(d => !(d.billingAddressId && d.billingAddress), {
        message: 'Provide either billingAddressId or billingAddress, not both',
        path: ['billingAddress'],
    });

export const orderStatusValues = [
    'pending',
    'paid',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
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
