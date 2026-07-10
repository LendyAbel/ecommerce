import { Prisma } from '../../../prisma/generated/prisma/client';
import { AppError } from '../../lib/AppError';
import { prisma } from '../../lib/prisma';

// Guard para validar que sea posible pagar una orden
export const assertPayableOrder = async (orderId: string, userId: string) => {
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
        include: { orderItems: { include: { product: true } } },
    });
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'pending')
        throw new AppError('Order is not payable in its current state', 409);

    for (const item of order.orderItems) {
        if (!item.product || item.product.stock < item.quantity) {
            throw new AppError(
                `Insufficient stock for "${item.nameAtPurchase}"`,
                409,
            );
        }
    }
    return order;
};

export const toCents = (decimal: Prisma.Decimal) =>
    Math.round(Number(decimal) * 100);
