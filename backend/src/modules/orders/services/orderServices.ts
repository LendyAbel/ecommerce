import { prisma } from '../../../lib/prisma';

const listOrders = async (userId: string) => {
    const orders = await prisma.order.findMany({
        where: {userId},
    })
    return orders
}

const 