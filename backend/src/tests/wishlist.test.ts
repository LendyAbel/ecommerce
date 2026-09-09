import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '../app';

// --- Mocks ---
jest.mock('../lib/prisma', () => {
    const prismaMock = {
        wishList: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
        },
        wishItem: {
            upsert: jest.fn(),
            findFirst: jest.fn(),
            delete: jest.fn(),
        },
        product: {
            findUnique: jest.fn(),
        },
    };
    return { prisma: prismaMock };
});

import { prisma } from '../lib/prisma';

// --- Helpers ---
const USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const PRODUCT_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const ITEM_ID = 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
const WISHLIST_ID = 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';

const customerToken = () =>
    jwt.sign({ userId: USER_ID, role: 'customer' }, process.env.JWT_SECRET!);

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
};

const mockWishItem = {
    id: ITEM_ID,
    productId: PRODUCT_ID,
    wishlistId: WISHLIST_ID,
    product: mockProduct,
};

const mockWishlist = {
    id: WISHLIST_ID,
    userId: USER_ID,
    wishItems: [mockWishItem],
};

// --- Tests ---
describe('Wishlist', () => {
    describe('GET /api/wishlist', () => {
        it('should return the user wishlist with status 200', async () => {
            (prisma.wishList.upsert as jest.Mock).mockResolvedValue(
                mockWishlist,
            );
            const token = customerToken();

            const res = await request(app)
                .get('/api/wishlist')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                id: WISHLIST_ID,
                userId: USER_ID,
            });
        });

        it('should create a wishlist if user has none', async () => {
            const emptyWishlist = { ...mockWishlist, wishItems: [] };
            (prisma.wishList.upsert as jest.Mock).mockResolvedValue(
                emptyWishlist,
            );
            const token = customerToken();

            const res = await request(app)
                .get('/api/wishlist')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(prisma.wishList.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: USER_ID },
                    update: {},
                    create: { userId: USER_ID },
                }),
            );
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get('/api/wishlist');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/wishlist/items', () => {
        it('should add a new item to the wishlist via upsert', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                mockProduct,
            );
            (prisma.wishList.upsert as jest.Mock).mockResolvedValue(
                mockWishlist,
            );
            (prisma.wishItem.upsert as jest.Mock).mockResolvedValue(
                mockWishItem,
            );
            (prisma.wishList.findUnique as jest.Mock).mockResolvedValue(
                mockWishlist,
            );
            const token = customerToken();

            const res = await request(app)
                .post('/api/wishlist/items')
                .set('Cookie', `token=${token}`)
                .send({ productId: PRODUCT_ID });

            expect(res.status).toBe(200);
            expect(prisma.wishItem.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        wishlistId_productId: {
                            wishlistId: WISHLIST_ID,
                            productId: PRODUCT_ID,
                        },
                    },
                    create: {
                        wishlistId: WISHLIST_ID,
                        productId: PRODUCT_ID,
                    },
                }),
            );
        });

        it('should be idempotent when the item is already in the wishlist', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                mockProduct,
            );
            (prisma.wishList.upsert as jest.Mock).mockResolvedValue(
                mockWishlist,
            );
            (prisma.wishItem.upsert as jest.Mock).mockResolvedValue(
                mockWishItem,
            );
            (prisma.wishList.findUnique as jest.Mock).mockResolvedValue(
                mockWishlist,
            );
            const token = customerToken();

            const res = await request(app)
                .post('/api/wishlist/items')
                .set('Cookie', `token=${token}`)
                .send({ productId: PRODUCT_ID });

            expect(res.status).toBe(200);
            expect(res.body.wishItems).toHaveLength(1);
        });

        it('should return 404 when product does not exist', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);
            const token = customerToken();

            const res = await request(app)
                .post('/api/wishlist/items')
                .set('Cookie', `token=${token}`)
                .send({ productId: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55' });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Product not found');
            expect(prisma.wishItem.upsert).not.toHaveBeenCalled();
        });

        it('should return 400 when productId is not a valid UUID', async () => {
            const token = customerToken();

            const res = await request(app)
                .post('/api/wishlist/items')
                .set('Cookie', `token=${token}`)
                .send({ productId: 'not-a-uuid' });

            expect(res.status).toBe(400);
            expect(prisma.product.findUnique).not.toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .post('/api/wishlist/items')
                .send({ productId: PRODUCT_ID });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/wishlist/items/:productId', () => {
        it('should return inWishlist true when the product is in the wishlist', async () => {
            (prisma.wishItem.findFirst as jest.Mock).mockResolvedValue({
                id: ITEM_ID,
            });
            const token = customerToken();

            const res = await request(app)
                .get(`/api/wishlist/items/${PRODUCT_ID}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ inWishlist: true });
            expect(prisma.wishItem.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        productId: PRODUCT_ID,
                        wishlist: { userId: USER_ID },
                    },
                }),
            );
        });

        it('should return inWishlist false when the product is not in the wishlist', async () => {
            (prisma.wishItem.findFirst as jest.Mock).mockResolvedValue(null);
            const token = customerToken();

            const res = await request(app)
                .get(`/api/wishlist/items/${PRODUCT_ID}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ inWishlist: false });
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get(
                `/api/wishlist/items/${PRODUCT_ID}`,
            );

            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/wishlist/items/:productId', () => {
        it('should remove an item from the wishlist', async () => {
            (prisma.wishItem.findFirst as jest.Mock).mockResolvedValue(
                mockWishItem,
            );
            (prisma.wishItem.delete as jest.Mock).mockResolvedValue(
                mockWishItem,
            );
            (prisma.wishList.findUnique as jest.Mock).mockResolvedValue({
                ...mockWishlist,
                wishItems: [],
            });
            const token = customerToken();

            const res = await request(app)
                .delete(`/api/wishlist/items/${PRODUCT_ID}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(prisma.wishItem.delete).toHaveBeenCalledWith({
                where: { id: ITEM_ID },
            });
        });

        it('should return 404 when the item is not in the wishlist', async () => {
            (prisma.wishItem.findFirst as jest.Mock).mockResolvedValue(null);
            const token = customerToken();

            const res = await request(app)
                .delete(`/api/wishlist/items/${PRODUCT_ID}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Item not found');
            expect(prisma.wishItem.delete).not.toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).delete(
                `/api/wishlist/items/${PRODUCT_ID}`,
            );

            expect(res.status).toBe(401);
        });
    });
});
