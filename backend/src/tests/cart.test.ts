import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '../app';

// --- Mocks ---
jest.mock('../lib/prisma', () => {
    const prismaMock = {
        cart: {
            upsert: jest.fn(),
            findUnique: jest.fn(),
        },
        cartItem: {
            findFirst: jest.fn(),
            upsert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    // Run interactive transactions against the same mock client.
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof prismaMock) => unknown) =>
        cb(prismaMock),
    );
    return { prisma: prismaMock };
});

import { prisma } from '../lib/prisma';

// --- Helpers ---
const USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const PRODUCT_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const ITEM_ID = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
const CART_ID = 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';

const customerToken = () =>
    jwt.sign(
        { userId: USER_ID, role: 'customer' },
        process.env.JWT_SECRET!,
    );

const mockProduct = {
    id: PRODUCT_ID,
    sku: 'SKU-001',
    name: 'Test Product',
    shortDescription: 'A product',
    price: 29.99,
    tax: 21,
    stock: 10,
    status: 'published',
    images: [],
    categories: [],
    mainCategory: null,
};

const mockCartItem = {
    id: ITEM_ID,
    quantity: 2,
    productId: PRODUCT_ID,
    cartId: CART_ID,
    product: mockProduct,
};

const mockCart = {
    id: CART_ID,
    userId: USER_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
    cartItems: [mockCartItem],
};

// --- Tests ---
describe('Cart', () => {
    // resetMocks wipes the factory implementation before each test, so re-wire
    // $transaction to run interactive callbacks against the mock client.
    beforeEach(() => {
        (prisma.$transaction as jest.Mock).mockImplementation(
            (cb: (tx: typeof prisma) => unknown) => cb(prisma),
        );
    });

    describe('GET /api/cart', () => {
        it('should return the user cart with status 200', async () => {
            (prisma.cart.upsert as jest.Mock).mockResolvedValue(mockCart);
            const token = customerToken();

            const res = await request(app)
                .get('/api/cart')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ id: CART_ID, userId: USER_ID });
        });

        it('should create a cart if user has none', async () => {
            const emptyCart = { ...mockCart, cartItems: [] };
            (prisma.cart.upsert as jest.Mock).mockResolvedValue(emptyCart);
            const token = customerToken();

            const res = await request(app)
                .get('/api/cart')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(prisma.cart.upsert).toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get('/api/cart');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/cart/items', () => {
        it('should add a new item to the cart via upsert', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                mockProduct,
            );
            (prisma.cart.upsert as jest.Mock).mockResolvedValue(mockCart);
            (prisma.cartItem.upsert as jest.Mock).mockResolvedValue({
                quantity: 2,
            });
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
            const token = customerToken();

            const res = await request(app)
                .post('/api/cart/items')
                .set('Cookie', `token=${token}`)
                .send({ productId: PRODUCT_ID, quantity: 2 });

            expect(res.status).toBe(200);
            expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        cartId_productId: {
                            cartId: CART_ID,
                            productId: PRODUCT_ID,
                        },
                    },
                    update: { quantity: { increment: 2 } },
                }),
            );
        });

        it('should increment quantity when item already exists in cart', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                mockProduct,
            );
            (prisma.cart.upsert as jest.Mock).mockResolvedValue(mockCart);
            (prisma.cartItem.upsert as jest.Mock).mockResolvedValue({
                quantity: 4,
            });
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
            const token = customerToken();

            const res = await request(app)
                .post('/api/cart/items')
                .set('Cookie', `token=${token}`)
                .send({ productId: PRODUCT_ID, quantity: 2 });

            expect(res.status).toBe(200);
            expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: { quantity: { increment: 2 } },
                }),
            );
        });

        it('should return 409 when requested quantity exceeds stock', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue({
                ...mockProduct,
                stock: 3,
            });
            (prisma.cart.upsert as jest.Mock).mockResolvedValue(mockCart);
            (prisma.cartItem.upsert as jest.Mock).mockResolvedValue({
                quantity: 5,
            });
            const token = customerToken();

            const res = await request(app)
                .post('/api/cart/items')
                .set('Cookie', `token=${token}`)
                .send({ productId: PRODUCT_ID, quantity: 5 });

            expect(res.status).toBe(409);
            expect(res.body).toHaveProperty('error', 'Not enough stock');
        });

        it('should return 404 when product does not exist', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
            const token = customerToken();

            const res = await request(app)
                .post('/api/cart/items')
                .set('Cookie', `token=${token}`)
                .send({ productId: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', quantity: 1 });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Product not found');
        });

        it('should return 400 when productId is not a valid UUID', async () => {
            const token = customerToken();

            const res = await request(app)
                .post('/api/cart/items')
                .set('Cookie', `token=${token}`)
                .send({ productId: 'not-a-uuid', quantity: 1 });

            expect(res.status).toBe(400);
        });

        it('should default quantity to 1 when not provided', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                mockProduct,
            );
            (prisma.cart.upsert as jest.Mock).mockResolvedValue(mockCart);
            (prisma.cartItem.upsert as jest.Mock).mockResolvedValue({
                quantity: 1,
            });
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
            const token = customerToken();

            await request(app)
                .post('/api/cart/items')
                .set('Cookie', `token=${token}`)
                .send({ productId: PRODUCT_ID });

            expect(prisma.cartItem.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    create: expect.objectContaining({ quantity: 1 }),
                    update: { quantity: { increment: 1 } },
                }),
            );
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .post('/api/cart/items')
                .send({ productId: PRODUCT_ID, quantity: 1 });

            expect(res.status).toBe(401);
        });
    });

    describe('PATCH /api/cart/items/:productId', () => {
        it('should update item quantity', async () => {
            (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue({
                ...mockCartItem,
                product: { stock: 10 },
            });
            (prisma.cartItem.update as jest.Mock).mockResolvedValue({
                ...mockCartItem,
                quantity: 5,
            });
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
            const token = customerToken();

            const res = await request(app)
                .patch(`/api/cart/items/${PRODUCT_ID}`)
                .set('Cookie', `token=${token}`)
                .send({ quantity: 5 });

            expect(res.status).toBe(200);
            expect(prisma.cartItem.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { productId: PRODUCT_ID, cart: { userId: USER_ID } },
                }),
            );
            expect(prisma.cartItem.update).toHaveBeenCalledWith(
                expect.objectContaining({ data: { quantity: 5 } }),
            );
        });

        it('should return 409 when new quantity exceeds stock', async () => {
            (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue({
                ...mockCartItem,
                product: { stock: 3 },
            });
            const token = customerToken();

            const res = await request(app)
                .patch(`/api/cart/items/${PRODUCT_ID}`)
                .set('Cookie', `token=${token}`)
                .send({ quantity: 5 });

            expect(res.status).toBe(409);
            expect(res.body).toHaveProperty('error', 'Not enough stock');
            expect(prisma.cartItem.update).not.toHaveBeenCalled();
        });

        it('should remove the item when quantity is set to 0', async () => {
            (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue({
                ...mockCartItem,
                product: { stock: 10 },
            });
            (prisma.cartItem.delete as jest.Mock).mockResolvedValue(
                mockCartItem,
            );
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
                ...mockCart,
                cartItems: [],
            });
            const token = customerToken();

            const res = await request(app)
                .patch(`/api/cart/items/${PRODUCT_ID}`)
                .set('Cookie', `token=${token}`)
                .send({ quantity: 0 });

            expect(res.status).toBe(200);
            expect(prisma.cartItem.delete).toHaveBeenCalledWith({
                where: { id: ITEM_ID },
            });
            expect(prisma.cartItem.update).not.toHaveBeenCalled();
        });

        it('should return 404 when the product is not in the user cart', async () => {
            (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue(null);
            const token = customerToken();

            const res = await request(app)
                .patch(`/api/cart/items/${PRODUCT_ID}`)
                .set('Cookie', `token=${token}`)
                .send({ quantity: 5 });

            expect(res.status).toBe(404);
        });

        it('should return 400 when quantity is negative', async () => {
            const token = customerToken();

            const res = await request(app)
                .patch(`/api/cart/items/${PRODUCT_ID}`)
                .set('Cookie', `token=${token}`)
                .send({ quantity: -1 });

            expect(res.status).toBe(400);
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .patch(`/api/cart/items/${PRODUCT_ID}`)
                .send({ quantity: 3 });

            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/cart/items/:productId', () => {
        it('should remove an item from the cart', async () => {
            (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue(
                mockCartItem,
            );
            (prisma.cartItem.delete as jest.Mock).mockResolvedValue(
                mockCartItem,
            );
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
                ...mockCart,
                cartItems: [],
            });
            const token = customerToken();

            const res = await request(app)
                .delete(`/api/cart/items/${PRODUCT_ID}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(prisma.cartItem.findFirst).toHaveBeenCalledWith({
                where: { productId: PRODUCT_ID, cart: { userId: USER_ID } },
            });
            expect(prisma.cartItem.delete).toHaveBeenCalledWith({
                where: { id: ITEM_ID },
            });
        });

        it('should return 404 when the product is not in the user cart', async () => {
            (prisma.cartItem.findFirst as jest.Mock).mockResolvedValue(null);
            const token = customerToken();

            const res = await request(app)
                .delete(`/api/cart/items/${PRODUCT_ID}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(404);
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).delete(
                `/api/cart/items/${PRODUCT_ID}`,
            );

            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/cart', () => {
        it('should clear all items in the cart', async () => {
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(mockCart);
            (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({
                count: 1,
            });
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue({
                ...mockCart,
                cartItems: [],
            });
            const token = customerToken();

            const res = await request(app)
                .delete('/api/cart')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
                where: { cartId: CART_ID },
            });
        });

        it('should return 404 when cart does not exist', async () => {
            (prisma.cart.findUnique as jest.Mock).mockResolvedValue(null);
            const token = customerToken();

            const res = await request(app)
                .delete('/api/cart')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(404);
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).delete('/api/cart');

            expect(res.status).toBe(401);
        });
    });
});
