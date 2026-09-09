import jwt from 'jsonwebtoken';
import request from 'supertest';

import { Prisma } from '../../prisma/generated/prisma/client';
import app from '../app';

// --- Mocks ---
jest.mock('../lib/prisma', () => {
    const prismaMock = {
        order: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        cart: {
            findUnique: jest.fn(),
        },
        address: {
            findFirst: jest.fn(),
        },
        product: {
            update: jest.fn(),
        },
        cartItem: {
            deleteMany: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    // Run interactive (callback) transactions against the same mock client;
    // run batch (array) transactions as a plain Promise.all.
    const runTransaction = (
        arg:
            | ((tx: typeof prismaMock) => unknown)
            | Promise<unknown>[],
    ) => (typeof arg === 'function' ? arg(prismaMock) : Promise.all(arg));
    prismaMock.$transaction.mockImplementation(runTransaction);
    return { prisma: prismaMock };
});

import { prisma } from '../lib/prisma';

// --- Helpers ---
const USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const ORDER_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const PRODUCT_ID = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
const CART_ID = 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';
const SHIPPING_ADDRESS_ID = 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55';
const BILLING_ADDRESS_ID = 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66';

const customerToken = () =>
    jwt.sign({ userId: USER_ID, role: 'customer' }, process.env.JWT_SECRET!);

const adminToken = () =>
    jwt.sign({ userId: 'admin-uuid', role: 'admin' }, process.env.JWT_SECRET!);

const mockProduct = {
    id: PRODUCT_ID,
    sku: 'SKU-001',
    name: 'Test Product',
    price: new Prisma.Decimal('29.99'),
    stock: 10,
};

const mockCartItem = {
    id: 'item-1',
    quantity: 2,
    productId: PRODUCT_ID,
    cartId: CART_ID,
    product: mockProduct,
};

const mockCart = {
    id: CART_ID,
    userId: USER_ID,
    cartItems: [mockCartItem],
};

const mockAddress = {
    id: SHIPPING_ADDRESS_ID,
    userId: USER_ID,
    fullName: 'Jane Doe',
    phone: '600000000',
    line1: 'Main St 1',
    line2: null,
    city: 'Madrid',
    state: 'Madrid',
    postalCode: '28001',
    country: 'ES',
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockOrder = {
    id: ORDER_ID,
    orderNumber: 1,
    status: 'pending',
    totalAmount: new Prisma.Decimal('59.98'),
    userId: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
};

// --- Tests ---
describe('Orders', () => {
    // resetMocks wipes the factory implementation before each test, so re-wire
    // $transaction to run interactive (callback) transactions against the mock
    // client, and batch (array) transactions as a plain Promise.all.
    beforeEach(() => {
        (prisma.$transaction as jest.Mock).mockImplementation(
            (arg: ((tx: typeof prisma) => unknown) | Promise<unknown>[]) =>
                typeof arg === 'function' ? arg(prisma) : Promise.all(arg),
        );
    });

    describe('GET /api/orders', () => {
        it('should return the orders of the authenticated user with status 200', async () => {
            (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
            (prisma.order.count as jest.Mock).mockResolvedValue(1);

            const res = await request(app)
                .get('/api/orders')
                .set('Cookie', `token=${customerToken()}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.total).toBe(1);
            expect(prisma.order.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { userId: USER_ID } }),
            );
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get('/api/orders');

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/orders/all', () => {
        it('should return all orders for an admin with status 200', async () => {
            (prisma.order.findMany as jest.Mock).mockResolvedValue([mockOrder]);
            (prisma.order.count as jest.Mock).mockResolvedValue(1);

            const res = await request(app)
                .get('/api/orders/all')
                .set('Cookie', `token=${adminToken()}`);

            expect(res.status).toBe(200);
            expect(prisma.order.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    include: expect.objectContaining({ user: expect.anything() }),
                }),
            );
        });

        it('should return 403 when requested by a non-admin user', async () => {
            const res = await request(app)
                .get('/api/orders/all')
                .set('Cookie', `token=${customerToken()}`);

            expect(res.status).toBe(403);
            expect(prisma.order.findMany).not.toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get('/api/orders/all');

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/orders/:orderId', () => {
        it('should return the order with its items with status 200', async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue({
                ...mockOrder,
                orderItems: [],
            });

            const res = await request(app)
                .get(`/api/orders/${ORDER_ID}`)
                .set('Cookie', `token=${customerToken()}`);

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ id: ORDER_ID });
            // A customer can only read their own orders.
            expect(prisma.order.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: ORDER_ID, userId: USER_ID },
                }),
            );
        });

        it('should let an admin read any order without the userId filter', async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue({
                ...mockOrder,
                orderItems: [],
            });

            const res = await request(app)
                .get(`/api/orders/${ORDER_ID}`)
                .set('Cookie', `token=${adminToken()}`);

            expect(res.status).toBe(200);
            expect(prisma.order.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: ORDER_ID } }),
            );
        });

        it('should return 404 when the order does not exist', async () => {
            (prisma.order.findFirst as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .get(`/api/orders/${ORDER_ID}`)
                .set('Cookie', `token=${customerToken()}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Order not found');
        });

        it('should return 400 when orderId is not a valid UUID', async () => {
            const res = await request(app)
                .get('/api/orders/not-a-uuid')
                .set('Cookie', `token=${customerToken()}`);

            expect(res.status).toBe(400);
            expect(prisma.order.findFirst).not.toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get(`/api/orders/${ORDER_ID}`);

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/orders', () => {
        const validBody = { shippingAddressId: SHIPPING_ADDRESS_ID };

        it('should create an order in pending status and clear the cart', async () => {
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
            (prisma.address.findFirst as jest.Mock).mockResolvedValue(
                mockAddress,
            );
            (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
            (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({
                count: 1,
            });

            const res = await request(app)
                .post('/api/orders')
                .set('Cookie', `token=${customerToken()}`)
                .send(validBody);

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({ id: ORDER_ID });
            // Stock is only decremented once payment is confirmed (Stripe
            // webhook), not at order creation.
            expect(prisma.product.update).not.toHaveBeenCalled();
            // Cart emptied after the order is placed.
            expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
                where: { cartId: CART_ID },
            });
        });

        it('should compute totalAmount as price * quantity for every item', async () => {
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
            (prisma.address.findFirst as jest.Mock).mockResolvedValue(
                mockAddress,
            );
            (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
            (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({
                count: 1,
            });

            await request(app)
                .post('/api/orders')
                .set('Cookie', `token=${customerToken()}`)
                .send(validBody);

            const createArg = (prisma.order.create as jest.Mock).mock
                .calls[0][0];
            // 29.99 * 2 = 59.98
            expect(createArg.data.totalAmount.toString()).toBe('59.98');
        });

        it('should fall back to the shipping address when no billing address is given', async () => {
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
            (prisma.address.findFirst as jest.Mock).mockResolvedValue(
                mockAddress,
            );
            (prisma.order.create as jest.Mock).mockResolvedValue(mockOrder);
            (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({
                count: 1,
            });

            await request(app)
                .post('/api/orders')
                .set('Cookie', `token=${customerToken()}`)
                .send(validBody);

            const createArg = (prisma.order.create as jest.Mock).mock
                .calls[0][0];
            expect(createArg.data.shippingAddress.create.fullName).toBe(
                'Jane Doe',
            );
            expect(createArg.data.billingAddress.create.fullName).toBe(
                'Jane Doe',
            );
        });

        it('should return 400 when the cart is empty', async () => {
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
                ...mockCart,
                cartItems: [],
            });

            const res = await request(app)
                .post('/api/orders')
                .set('Cookie', `token=${customerToken()}`)
                .send(validBody);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Cart is empty');
            expect(prisma.order.create).not.toHaveBeenCalled();
        });

        it('should return 400 when the user has no cart', async () => {
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .post('/api/orders')
                .set('Cookie', `token=${customerToken()}`)
                .send(validBody);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Cart is empty');
        });

        it('should return 404 when the shipping address does not belong to the user', async () => {
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
            // Address book lookup returns nothing for this user.
            (prisma.address.findFirst as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .post('/api/orders')
                .set('Cookie', `token=${customerToken()}`)
                .send(validBody);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Address not found');
            expect(prisma.order.create).not.toHaveBeenCalled();
        });

        it('should return 404 when the billing address is missing from the address book', async () => {
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
            // Shipping address resolves, billing one (looked up second) is absent.
            (prisma.address.findFirst as jest.Mock)
                .mockResolvedValueOnce(mockAddress)
                .mockResolvedValueOnce(null);

            const res = await request(app)
                .post('/api/orders')
                .set('Cookie', `token=${customerToken()}`)
                .send({
                    shippingAddressId: SHIPPING_ADDRESS_ID,
                    billingAddressId: BILLING_ADDRESS_ID,
                });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Address not found');
        });

        it('should return 409 when there is not enough stock', async () => {
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
                ...mockCart,
                cartItems: [
                    { ...mockCartItem, quantity: 99, product: mockProduct },
                ],
            });
            (prisma.address.findFirst as jest.Mock).mockResolvedValue(
                mockAddress,
            );

            const res = await request(app)
                .post('/api/orders')
                .set('Cookie', `token=${customerToken()}`)
                .send(validBody);

            expect(res.status).toBe(409);
            expect(res.body.error).toContain('Not enough stock');
            expect(prisma.order.create).not.toHaveBeenCalled();
        });

        it('should return 400 when shippingAddressId is not a valid UUID', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Cookie', `token=${customerToken()}`)
                .send({ shippingAddressId: 'not-a-uuid' });

            expect(res.status).toBe(400);
            expect(prisma.cart.findUnique).not.toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).post('/api/orders').send(validBody);

            expect(res.status).toBe(401);
        });
    });

    describe('PATCH /api/orders/:orderId/status', () => {
        it('should update the order status as an admin', async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue({
                ...mockOrder,
                status: 'pending',
                orderItems: [],
            });
            (prisma.order.update as jest.Mock).mockResolvedValue({
                ...mockOrder,
                status: 'shipped',
            });

            const res = await request(app)
                .patch(`/api/orders/${ORDER_ID}/status`)
                .set('Cookie', `token=${adminToken()}`)
                .send({ status: 'shipped' });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ status: 'shipped' });
            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: ORDER_ID },
                data: { status: 'shipped' },
                include: { orderItems: true, shippingAddress: true },
            });
        });

        // Stock is decremented at payment-confirmation time (Stripe webhook),
        // not at order creation, so updateStatusOrder has no stock to restore
        // when an admin cancels an order — even a previously 'paid' one.
        it('should not touch product stock when cancelling a paid order', async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue({
                ...mockOrder,
                status: 'paid',
                orderItems: [{ productId: PRODUCT_ID, quantity: 2 }],
            });
            (prisma.order.update as jest.Mock).mockResolvedValue({
                ...mockOrder,
                status: 'cancelled',
            });

            const res = await request(app)
                .patch(`/api/orders/${ORDER_ID}/status`)
                .set('Cookie', `token=${adminToken()}`)
                .send({ status: 'cancelled' });

            expect(res.status).toBe(200);
            expect(prisma.product.update).not.toHaveBeenCalled();
            expect(prisma.order.update).toHaveBeenCalledWith({
                where: { id: ORDER_ID },
                data: { status: 'cancelled' },
                include: { orderItems: true, shippingAddress: true },
            });
        });

        it('should return 404 when the order does not exist', async () => {
            (prisma.order.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .patch(`/api/orders/${ORDER_ID}/status`)
                .set('Cookie', `token=${adminToken()}`)
                .send({ status: 'shipped' });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Order not found');
        });

        it('should return 400 when the status is not a valid enum value', async () => {
            const res = await request(app)
                .patch(`/api/orders/${ORDER_ID}/status`)
                .set('Cookie', `token=${adminToken()}`)
                .send({ status: 'not-a-status' });

            expect(res.status).toBe(400);
            expect(prisma.order.findUnique).not.toHaveBeenCalled();
        });

        it('should return 400 when orderId is not a valid UUID', async () => {
            const res = await request(app)
                .patch('/api/orders/not-a-uuid/status')
                .set('Cookie', `token=${adminToken()}`)
                .send({ status: 'shipped' });

            expect(res.status).toBe(400);
        });

        it('should return 403 when requested by a non-admin user', async () => {
            const res = await request(app)
                .patch(`/api/orders/${ORDER_ID}/status`)
                .set('Cookie', `token=${customerToken()}`)
                .send({ status: 'shipped' });

            expect(res.status).toBe(403);
            expect(prisma.order.update).not.toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .patch(`/api/orders/${ORDER_ID}/status`)
                .send({ status: 'shipped' });

            expect(res.status).toBe(401);
        });
    });
});
