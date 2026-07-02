import { Prisma } from '../../../../generated/prisma/client';
import { AppError } from '../../../lib/AppError';
import { prisma } from '../../../lib/prisma';
import {
    Address,
    AddressInput,
    CreateOrderInput,
    OrdersQuery,
    OrderStatus,
} from '../schemas/ordersZodSchema';

// Congela una dirección inline (de un solo uso) para guardarla en la orden.
const freezeInputAddress = (a: AddressInput) => ({
    fullName: a.fullName,
    phone: a.phone ?? null,
    line1: a.line1,
    line2: a.line2 ?? null,
    city: a.city,
    state: a.state ?? null,
    postalCode: a.postalCode,
    country: a.country,
});
const freezeBookAddress = (a: Address) => ({
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country,
});

const adminIncludes = {
    user: {
        select: { id: true, name: true, email: true },
    },
};

const listUserOrders = async (
    userId: string,
    filters: Partial<OrdersQuery>,
) => {
    const { page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    const [data, total] = await prisma.$transaction([
        prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
        }),
        prisma.order.count({ where: { userId } }),
    ]);
    return { data, total, page, limit };
};


const listAllOrders = async (filters: Partial<OrdersQuery>) => {
    const { page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    const [data, total] = await prisma.$transaction([
        prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: adminIncludes,
            skip: offset,
            take: limit,
        }),
        prisma.order.count(),
    ]);
    return { data, total, page, limit };
};

const getOrderbyId = async (orderId: string, userId: string, role: string) => {
    const isAdmin = role === 'admin';
    const order = await prisma.order.findFirst({
        // El admin puede ver cualquier orden; el usuario solo las suyas.
        where: { id: orderId, ...(isAdmin ? {} : { userId }) },
        include: {
            orderItems: true,
            // Solo el admin necesita saber a qué cliente pertenece la orden.
            ...(isAdmin
                ? { user: { select: { id: true, name: true, email: true } } }
                : {}),
        },
    });
    if (!order) throw new AppError('Order not found', 404);
    return order;
};

const createOrder = async (userId: string, data: CreateOrderInput) => {
    return await prisma.$transaction(async tx => {
        // 1. Cargar el carrito con los productos.
        const cart = await tx.cart.findUnique({
            where: { userId },
            include: { cartItems: { include: { product: true } } },
        });
        if (!cart || cart.cartItems.length === 0) {
            throw new AppError('Cart is empty', 400);
        }

        // 2. Resolver parahacer una copia "congelada". Puede venir como
        //    id de la libreta (hay que verificar que es del usuario) o como una
        //    dirección inline de un solo uso (se congela tal cual).
        const resolveFrozen = async (
            id: string | undefined,
            inline: typeof data.shippingAddress,
        ) => {
            if (id) {
                const saved = await tx.address.findFirst({
                    where: { id, userId },
                });
                if (!saved) throw new AppError('Address not found', 404);
                return freezeBookAddress(saved);
            }
            // inline garantizado por el schema (id XOR inline en envío; en
            // facturación, este helper solo se llama si hay id o inline).
            return freezeInputAddress(inline!);
        };

        const shippingFrozen = await resolveFrozen(
            data.shippingAddressId,
            data.shippingAddress,
        );
        // Sin datos de facturación, se factura a la misma dirección de envío.
        const billingFrozen =
            data.billingAddressId || data.billingAddress
                ? await resolveFrozen(
                      data.billingAddressId,
                      data.billingAddress,
                  )
                : shippingFrozen;

        // 3. Validar stock y construir los items con snapshot del producto.
        let totalAmount = new Prisma.Decimal(0);
        const orderItems = cart.cartItems.map(item => {
            if (item.quantity > item.product.stock) {
                throw new AppError(
                    `Not enough stock for ${item.product.name}`,
                    409,
                );
            }
            totalAmount = totalAmount.add(
                item.product.price.mul(item.quantity),
            );
            return {
                productId: item.product.id,
                skuAtPurchase: item.product.sku,
                nameAtPurchase: item.product.name,
                priceAtPurchase: item.product.price,
                quantity: item.quantity,
            };
        });

        // 4. Crear la orden con items y copias de direcciones anidadas.
        const order = await tx.order.create({
            data: {
                user: { connect: { id: userId } },
                totalAmount,
                orderItems: { create: orderItems },
                shippingAddress: { create: shippingFrozen },
                billingAddress: { create: billingFrozen },
            },
            include: {
                orderItems: true,
                shippingAddress: true,
                billingAddress: true,
            },
        });
        // 5. Vaciar el carrito.
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return order;
    });
};

// Actualizar los distintos estados de los pedidos, solo autorizado ADMIN
const updateStatusOrder = async (
    orderId: string,
    statusUpdate: OrderStatus,
) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
    });
    if (!order) throw new AppError('Order not found', 404);

    return await prisma.order.update({
        where: { id: orderId },
        data: { status: statusUpdate },
    });
};

// Cancelación iniciada por el propio cliente. solo permite cancelar una orden
// PROPIA y que siga PENDIENTE de pago.
const cancelOwnOrder = async (orderId: string, userId: string) => {
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: { orderItems: true },
    });
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'pending')
        throw new AppError('Only pending orders can be cancelled', 409);

    return await prisma.order.update({
        where: { id: orderId },
        data: { status: 'cancelled' },
    });
};

export default {
    listUserOrders,
    listAllOrders,
    getOrderbyId,
    createOrder,
    updateStatusOrder,
    cancelOwnOrder,
};
