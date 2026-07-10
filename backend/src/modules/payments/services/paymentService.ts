import { config } from '../../../lib/config';
import { prisma } from '../../../lib/prisma';
import { stripe } from '../../../lib/stripe';
import { assertPayableOrder, toCents } from '../utils';

const createCheckoutSession = async (
    orderId: string,
    userId: string,
    idempotencyKey?: string,
) => {
    const order = await assertPayableOrder(orderId, userId);

    const session = await stripe.checkout.sessions.create(
        {
            mode: 'payment',
            line_items: order.orderItems.map(item => ({
                price_data: {
                    currency: config.STRIPE_CURRENCY,
                    product_data: { name: item.nameAtPurchase },
                    unit_amount: toCents(item.priceAtPurchase),
                },
                quantity: item.quantity,
            })),
            metadata: { orderId: order.id },
            payment_intent_data: { metadata: { orderId: order.id } },
            success_url: `${config.FRONTEND_URL}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config.FRONTEND_URL}/checkout/cancel?orderId=${order.id}`,
        },
        idempotencyKey ? { idempotencyKey } : undefined,
    );
    await prisma.order.update({
        where: { id: order.id },
        data: { stripeCheckoutSessionId: session.id },
    });
    return { id: session.id, url: session.url };
};

class StockConflictError extends Error {
    constructor(
        public orderId: string,
        public productId: string,
    ) {
        super();
    }
}

const confirmOrderPayment = async (params: {
    orderId: string;
    stripePaymentIntentId: string;
    stripeCheckoutSessionId?: string;
}) => {
    try {
        const result = await prisma.$transaction(async tx => {
            const order = await tx.order.findUnique({
                where: { id: params.orderId },
                include: { orderItems: true },
            });
            if (!order || order.status !== 'pending') return null;

            for (const item of order.orderItems) {
                if (!item.productId) continue;
                const { count } = await tx.product.updateMany({
                    where: {
                        id: item.productId,
                        stock: { gte: item.quantity },
                    },
                    data: { stock: { decrement: item.quantity } },
                });
                if (count === 0)
                    throw new StockConflictError(order.id, item.productId);
            }
            return tx.order.update({
                where: { id: order.id },
                data: {
                    status: 'paid',
                    stripePaymentIntentId: params.stripePaymentIntentId,
                    ...(params.stripeCheckoutSessionId && {
                        stripeCheckoutSessionId: params.stripeCheckoutSessionId,
                    }),
                },
            });
        });
        return { ok: true as const, order: result };
    } catch (err) {
        if (err instanceof StockConflictError) {
            // El rollback de la transacción ya ocurrió: nadie quedó 'paid' con stock insuficiente.
            await stripe.refunds.create({
                payment_intent: params.stripePaymentIntentId,
            });
            await prisma.order.update({
                where: { id: err.orderId },
                data: { status: 'refunded' },
            });
            return { ok: false as const, reason: 'stock_conflict' as const };
        }
        throw err;
    }
};

export default { createCheckoutSession, confirmOrderPayment };
