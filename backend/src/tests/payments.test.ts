import jwt from 'jsonwebtoken';
import request from 'supertest';

import { Prisma } from '../../prisma/generated/prisma/client';
import app from '../app';

// --- Mocks ---
jest.mock('../lib/prisma', () => {
    const prismaMock = {
        order: {
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        product: {
            updateMany: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    prismaMock.$transaction.mockImplementation(
        (cb: (tx: typeof prismaMock) => unknown) => cb(prismaMock),
    );
    return { prisma: prismaMock };
});

jest.mock('../lib/stripe', () => ({
    stripe: {
        checkout: { sessions: { create: jest.fn() } },
        webhooks: { constructEvent: jest.fn() },
        refunds: { create: jest.fn() },
    },
}));

import { prisma } from '../lib/prisma';
import { stripe } from '../lib/stripe';

// --- Helpers ---
const USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const ORDER_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const PRODUCT_ID = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

const customerToken = () =>
    jwt.sign({ userId: USER_ID, role: 'customer' }, process.env.JWT_SECRET!);

const mockOrderItem = {
    id: 'item-1',
    productId: PRODUCT_ID,
    nameAtPurchase: 'Test Product',
    priceAtPurchase: new Prisma.Decimal('29.99'),
    quantity: 2,
    product: { id: PRODUCT_ID, stock: 10 },
};

const mockPayableOrder = {
    id: ORDER_ID,
    userId: USER_ID,
    status: 'pending',
    orderItems: [mockOrderItem],
};

// --- Tests ---
describe('Payments', () => {
    beforeEach(() => {
        (prisma.$transaction as jest.Mock).mockImplementation(
            (cb: (tx: typeof prisma) => unknown) => cb(prisma),
        );
    });

    describe('POST /api/orders/:orderId/checkout-session', () => {
        it('should create a Stripe checkout session for a payable order', async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue(
                mockPayableOrder,
            );
            (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
                id: 'cs_test_123',
                url: 'https://checkout.stripe.com/cs_test_123',
            });
            (prisma.order.update as jest.Mock).mockResolvedValue({
                ...mockPayableOrder,
                stripeCheckoutSessionId: 'cs_test_123',
            });
            const token = customerToken();

            const res = await request(app)
                .post(`/api/orders/${ORDER_ID}/checkout-session`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                id: 'cs_test_123',
                url: 'https://checkout.stripe.com/cs_test_123',
            });
            expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    mode: 'payment',
                    metadata: { orderId: ORDER_ID },
                }),
                undefined,
            );
            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: ORDER_ID },
                data: { stripeCheckoutSessionId: 'cs_test_123' },
            });
        });

        it('should forward the Idempotency-Key header to Stripe', async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue(
                mockPayableOrder,
            );
            (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
                id: 'cs_test_123',
                url: 'https://checkout.stripe.com/cs_test_123',
            });
            (prisma.order.update as jest.Mock).mockResolvedValue(
                mockPayableOrder,
            );
            const token = customerToken();

            await request(app)
                .post(`/api/orders/${ORDER_ID}/checkout-session`)
                .set('Cookie', `token=${token}`)
                .set('Idempotency-Key', 'idem-key-1');

            expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
                expect.anything(),
                { idempotencyKey: 'idem-key-1' },
            );
        });

        it('should return 404 when the order does not belong to the user', async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);
            const token = customerToken();

            const res = await request(app)
                .post(`/api/orders/${ORDER_ID}/checkout-session`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Order not found');
            expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
        });

        it('should return 409 when the order is not in a payable state', async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue({
                ...mockPayableOrder,
                status: 'paid',
            });
            const token = customerToken();

            const res = await request(app)
                .post(`/api/orders/${ORDER_ID}/checkout-session`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(409);
            expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
        });

        it('should return 409 when an item no longer has enough stock', async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue({
                ...mockPayableOrder,
                orderItems: [
                    {
                        ...mockOrderItem,
                        quantity: 5,
                        product: { id: PRODUCT_ID, stock: 1 },
                    },
                ],
            });
            const token = customerToken();

            const res = await request(app)
                .post(`/api/orders/${ORDER_ID}/checkout-session`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(409);
            expect(res.body.error).toContain('Insufficient stock');
            expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
        });

        it('should return 400 when orderId is not a valid UUID', async () => {
            const token = customerToken();

            const res = await request(app)
                .post('/api/orders/not-a-uuid/checkout-session')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(400);
            expect(prisma.order.findFirst).not.toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).post(
                `/api/orders/${ORDER_ID}/checkout-session`,
            );

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/webhooks/stripe', () => {
        const stripeEvent = (event: unknown) => {
            (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
                event,
            );
            return request(app)
                .post('/api/webhooks/stripe')
                .set('stripe-signature', 'test-signature')
                .set('Content-Type', 'application/json')
                .send(Buffer.from(JSON.stringify(event)));
        };

        it('should mark the order as paid and decrement stock on checkout.session.completed', async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue({
                id: ORDER_ID,
                status: 'pending',
                orderItems: [{ productId: PRODUCT_ID, quantity: 2 }],
            });
            (prisma.product.updateMany as jest.Mock).mockResolvedValue({
                count: 1,
            });
            (prisma.order.update as jest.Mock).mockResolvedValue({
                id: ORDER_ID,
                status: 'paid',
            });

            const res = await stripeEvent({
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_test_123',
                        metadata: { orderId: ORDER_ID },
                        payment_intent: 'pi_test_123',
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ received: true });
            expect(prisma.product.updateMany).toHaveBeenCalledWith({
                where: { id: PRODUCT_ID, stock: { gte: 2 } },
                data: { stock: { decrement: 2 } },
            });
            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: ORDER_ID },
                data: {
                    status: 'paid',
                    stripePaymentIntentId: 'pi_test_123',
                    stripeCheckoutSessionId: 'cs_test_123',
                },
            });
        });

        it('should refund and mark the order refunded on a stock conflict', async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue({
                id: ORDER_ID,
                status: 'pending',
                orderItems: [{ productId: PRODUCT_ID, quantity: 99 }],
            });
            (prisma.product.updateMany as jest.Mock).mockResolvedValue({
                count: 0,
            });
            (stripe.refunds.create as jest.Mock).mockResolvedValue({
                id: 're_test_123',
            });
            (prisma.order.update as jest.Mock).mockResolvedValue({
                id: ORDER_ID,
                status: 'refunded',
            });

            const res = await stripeEvent({
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_test_123',
                        metadata: { orderId: ORDER_ID },
                        payment_intent: 'pi_test_123',
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(stripe.refunds.create).toHaveBeenCalledWith({
                payment_intent: 'pi_test_123',
            });
            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: ORDER_ID },
                data: { status: 'refunded' },
            });
        });

        it('should not reprocess an order that is no longer pending (idempotency)', async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue({
                id: ORDER_ID,
                status: 'paid',
                orderItems: [{ productId: PRODUCT_ID, quantity: 2 }],
            });

            const res = await stripeEvent({
                type: 'checkout.session.completed',
                data: {
                    object: {
                        id: 'cs_test_123',
                        metadata: { orderId: ORDER_ID },
                        payment_intent: 'pi_test_123',
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(prisma.product.updateMany).not.toHaveBeenCalled();
            expect(prisma.order.update).not.toHaveBeenCalled();
        });

        it('should ignore event types it does not handle', async () => {
            const res = await stripeEvent({
                type: 'payment_intent.created',
                data: { object: {} },
            });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ received: true });
            expect(prisma.order.findUnique).not.toHaveBeenCalled();
        });

        it('should return 400 when the signature verification fails', async () => {
            (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(
                () => {
                    throw new Error('invalid signature');
                },
            );

            const res = await request(app)
                .post('/api/webhooks/stripe')
                .set('stripe-signature', 'bad-signature')
                .set('Content-Type', 'application/json')
                .send(Buffer.from('{}'));

            expect(res.status).toBe(400);
            expect(prisma.order.findUnique).not.toHaveBeenCalled();
        });
    });
});
