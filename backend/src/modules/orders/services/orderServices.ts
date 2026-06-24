import { Prisma } from '../../../../generated/prisma/client';
import { AppError } from '../../../lib/AppError';
import { prisma } from '../../../lib/prisma';
import { freezeAddress } from '../../../lib/utils';
import { CreateOrderInput, OrderStatus } from '../schemas/ordersZodSchema';

const listOrders = async (userId: string) => {
    return await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
};

const listAllOrders = async () => {
    return await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, email: true } },
        },
    });
};

const getOrderbyId = async (orderId: string, userId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId, userId },
        include: { orderItems: true },
    });
    if (!order) throw new AppError('Order not found', 404);
    return order;
};

const createOrder = async (userId: string, data: CreateOrderInput) => {
    return await prisma.$transaction(async tx => {
        // 1. Cargar el carrito con sus productos.
        const cart = await tx.cart.findUnique({
            where: { userId },
            include: { cartItems: { include: { product: true } } },
        });
        if (!cart || cart.cartItems.length === 0) {
            throw new AppError('Cart is empty', 400);
        }

        // 2. Verificar que las direcciones son de la libreta del usuario
        const addressIds = [data.shippingAddressId];
        if (data.billingAddressId) addressIds.push(data.billingAddressId);

        const addresses = await tx.address.findMany({
            where: { id: { in: addressIds }, userId },
        });
        const shippingAddress = addresses.find(
            a => a.id === data.shippingAddressId,
        );
        const billingAddress = data.billingAddressId
            ? addresses.find(a => a.id === data.billingAddressId)
            : shippingAddress;
        if (!shippingAddress || !billingAddress)
            throw new AppError('Addresses not found', 404);

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
                shippingAddress: { create: freezeAddress(shippingAddress) },
                billingAddress: { create: freezeAddress(billingAddress) },
            },
            include: {
                orderItems: true,
                shippingAddress: true,
                billingAddress: true,
            },
        });

        // 5. Descontar stock. (Esto se podría implementar una vez que se pague en vez de ahora)
        await Promise.all(
            cart.cartItems.map(item =>
                tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                }),
            ),
        );

        // 7. Vaciar el carrito.
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return order;
    });
};

const updateStatusOrder = async (
    orderId: string,
    statusUpdate: OrderStatus,
) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
    });
    if (!order) throw new AppError('Orden no encontrada', 404);

    // Si se cancela una orden se repone el stock antes reservado
    if (statusUpdate === 'cancelled' && order.status !== 'cancelled') {
        return await prisma.$transaction(async tx => {
            await Promise.all(
                order.orderItems
                    // Filtrar productos activos de productos eliminados presentes en la orden
                    .filter(
                        (item): item is typeof item & { productId: string } =>
                            item.productId !== null,
                    )
                    // Incrementar el stock de productos activos
                    .map(item =>
                        tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity } },
                        }),
                    ),
            );
            return tx.order.update({
                where: { id: orderId },
                data: { status: statusUpdate },
            });
        });
    }

    return await prisma.order.update({
        where: { id: orderId },
        data: { status: statusUpdate },
    });
};

export default {
    listOrders,
    listAllOrders,
    getOrderbyId,
    createOrder,
    updateStatusOrder,
};
