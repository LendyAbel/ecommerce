import z from 'zod';

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

// --- Dirección (libreta del usuario y copia congelada en la orden) ---
export const AddressSchema = z.object({
    id: z.uuid(),
    fullName: z.string(),
    phone: z.string().nullable().optional(),
    line1: z.string(),
    line2: z.string().nullable().optional(),
    city: z.string(),
    state: z.string().nullable().optional(),
    postalCode: z.string(),
    country: z.string(),
});
export type Address = z.infer<typeof AddressSchema>;

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

// --- Input para crear una orden (payload al backend) ---
export const CreateOrderSchema = z.object({
    shippingAddressId: z.uuid(),
    billingAddressId: z.uuid().optional(),
});
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
