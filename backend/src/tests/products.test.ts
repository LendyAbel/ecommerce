import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

// --- Mocks ---
jest.mock('../lib/prisma', () => {
    const prismaMock = {
        product: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        category: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            deleteMany: jest.fn(),
        },
        $queryRaw: jest.fn(),
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
const adminToken = () =>
    jwt.sign({ userId: 'admin-uuid', role: 'admin' }, process.env.JWT_SECRET!);

const customerToken = () =>
    jwt.sign(
        { userId: 'customer-uuid', role: 'customer' },
        process.env.JWT_SECRET!,
    );

const mockProduct = {
    id: 'product-uuid-123',
    sku: 'SKU-001',
    name: 'Test Product',
    shortDescription: 'A test product',
    longDescription: null,
    brand: 'TestBrand',
    price: 29.99,
    tax: 21,
    stock: 10,
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date(),
    mainCategoryId: null,
    images: [],
    categories: [],
    mainCategory: null,
};

const validProductPayload = {
    sku: 'SKU-001',
    name: 'Test Product',
    shortDescription: 'A test product',
    price: 29.99,
    categories: [],
    images: [],
};

// --- Tests ---
describe('Products', () => {
    // resetMocks wipes the factory implementation before each test, so re-wire
    // $transaction to run interactive callbacks against the mock client.
    beforeEach(() => {
        (prisma.$transaction as jest.Mock).mockImplementation(
            (cb: (tx: typeof prisma) => unknown) => cb(prisma),
        );
    });

    describe('GET /api/products', () => {
        it('should return a paginated payload with status 200', async () => {
            (prisma.$queryRaw as jest.Mock).mockResolvedValue([
                { id: mockProduct.id, total: 1 },
            ]);
            (prisma.product.findMany as jest.Mock).mockResolvedValue([
                mockProduct,
            ]);

            const res = await request(app).get('/api/products');

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ total: 1, page: 1, limit: 20 });
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0]).toMatchObject({ sku: mockProduct.sku });
        });

        it('should return an empty page when no products match', async () => {
            (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

            const res = await request(app).get('/api/products');

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ data: [], total: 0 });
            expect(prisma.product.findMany).not.toHaveBeenCalled();
        });

        it('should honor page and limit query params', async () => {
            (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

            const res = await request(app).get('/api/products?page=2&limit=5');

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ page: 2, limit: 5 });
        });

        it('should not require authentication', async () => {
            (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

            const res = await request(app).get('/api/products');

            expect(res.status).toBe(200);
        });
    });

    describe('GET /api/products/:id', () => {
        it('should return a product by ID', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(
                mockProduct,
            );

            const res = await request(app).get(
                `/api/products/${mockProduct.id}`,
            );

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ id: mockProduct.id });
        });

        it('should return 404 when product does not exist', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await request(app).get(
                '/api/products/non-existent-uuid',
            );

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Product not found');
        });
    });

    describe('POST /api/products', () => {
        it('should create a product when admin is authenticated', async () => {
            (prisma.product.create as jest.Mock).mockResolvedValue(mockProduct);
            const token = adminToken();

            const res = await request(app)
                .post('/api/products')
                .set('Cookie', `token=${token}`)
                .send(validProductPayload);

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({ sku: mockProduct.sku });
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .post('/api/products')
                .send(validProductPayload);

            expect(res.status).toBe(401);
        });

        it('should return 403 when authenticated as customer', async () => {
            const token = customerToken();

            const res = await request(app)
                .post('/api/products')
                .set('Cookie', `token=${token}`)
                .send(validProductPayload);

            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return 400 when required fields are missing', async () => {
            const token = adminToken();

            const res = await request(app)
                .post('/api/products')
                .set('Cookie', `token=${token}`)
                .send({ name: 'Incomplete Product' });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation error');
        });

        it('should return 400 when price is negative', async () => {
            const token = adminToken();

            const res = await request(app)
                .post('/api/products')
                .set('Cookie', `token=${token}`)
                .send({ ...validProductPayload, price: -5 });

            expect(res.status).toBe(400);
        });

        it('should return 400 when tax is out of range', async () => {
            const token = adminToken();

            const res = await request(app)
                .post('/api/products')
                .set('Cookie', `token=${token}`)
                .send({ ...validProductPayload, tax: 150 });

            expect(res.status).toBe(400);
        });
    });

    describe('PATCH /api/products/:id', () => {
        it('should update a product when admin is authenticated', async () => {
            (prisma.product.update as jest.Mock).mockResolvedValue({
                ...mockProduct,
                name: 'Updated Name',
            });
            const token = adminToken();

            const res = await request(app)
                .patch(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`)
                .send({ name: 'Updated Name' });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ name: 'Updated Name' });
        });

        it('should only send the provided fields to Prisma (PATCH semantics)', async () => {
            (prisma.product.update as jest.Mock).mockResolvedValue(mockProduct);
            const token = adminToken();

            await request(app)
                .patch(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`)
                .send({ price: 49.99 });

            expect(prisma.product.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: mockProduct.id },
                    data: { price: 49.99 },
                }),
            );
        });

        it('should replace categories and images when provided', async () => {
            (prisma.product.update as jest.Mock).mockResolvedValue(mockProduct);
            const token = adminToken();

            await request(app)
                .patch(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`)
                .send({
                    categories: ['Electronics'],
                    images: [{ url: 'https://x.com/a.png', isMain: true }],
                });

            const callData = (prisma.product.update as jest.Mock).mock
                .calls[0][0].data;
            expect(callData.categories).toMatchObject({ set: [] });
            expect(callData.images).toMatchObject({ deleteMany: {} });
        });

        it('should return 400 when more than one image is marked as main', async () => {
            const token = adminToken();

            const res = await request(app)
                .patch(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`)
                .send({
                    images: [
                        { url: 'https://x.com/a.png', isMain: true },
                        { url: 'https://x.com/b.png', isMain: true },
                    ],
                });

            expect(res.status).toBe(400);
            expect(prisma.product.update).not.toHaveBeenCalled();
        });

        it('should return 400 when price is negative', async () => {
            const token = adminToken();

            const res = await request(app)
                .patch(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`)
                .send({ price: -5 });

            expect(res.status).toBe(400);
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .patch(`/api/products/${mockProduct.id}`)
                .send({ name: 'Updated Name' });

            expect(res.status).toBe(401);
        });

        it('should return 403 when authenticated as customer', async () => {
            const token = customerToken();

            const res = await request(app)
                .patch(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`)
                .send({ name: 'Updated Name' });

            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/products/:id', () => {
        beforeEach(() => {
            (prisma.category.deleteMany as jest.Mock).mockResolvedValue({
                count: 0,
            });
            (prisma.category.findMany as jest.Mock).mockResolvedValue([]);
        });

        it('should delete a product without categories and return 200', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue({
                mainCategoryId: null,
                categories: [],
            });
            (prisma.product.delete as jest.Mock).mockResolvedValue(mockProduct);
            const token = adminToken();

            const res = await request(app)
                .delete(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ id: mockProduct.id });
            // No candidate categories -> the orphan recompute is skipped entirely.
            expect(prisma.category.findMany).not.toHaveBeenCalled();
            expect(prisma.category.deleteMany).not.toHaveBeenCalled();
        });

        it('should delete orphaned mainCategory when no other product references it', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue({
                mainCategoryId: 'cat-main-uuid',
                categories: [],
            });
            (prisma.product.delete as jest.Mock).mockResolvedValue(mockProduct);
            (prisma.category.findMany as jest.Mock).mockResolvedValue([
                { id: 'cat-main-uuid' },
            ]);
            const token = adminToken();

            const res = await request(app)
                .delete(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(prisma.category.deleteMany).toHaveBeenCalledWith({
                where: { id: { in: ['cat-main-uuid'] } },
            });
        });

        it('should delete orphaned many-to-many category when no other product references it', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue({
                mainCategoryId: null,
                categories: [{ id: 'cat-m2m-uuid' }],
            });
            (prisma.product.delete as jest.Mock).mockResolvedValue(mockProduct);
            (prisma.category.findMany as jest.Mock).mockResolvedValue([
                { id: 'cat-m2m-uuid' },
            ]);
            const token = adminToken();

            const res = await request(app)
                .delete(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(prisma.category.deleteMany).toHaveBeenCalledWith({
                where: { id: { in: ['cat-m2m-uuid'] } },
            });
        });

        it('should not delete category still referenced by another product', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue({
                mainCategoryId: 'cat-shared-uuid',
                categories: [],
            });
            (prisma.product.delete as jest.Mock).mockResolvedValue(mockProduct);
            // The recompute query finds no orphans, so nothing is deleted.
            (prisma.category.findMany as jest.Mock).mockResolvedValue([]);
            const token = adminToken();

            const res = await request(app)
                .delete(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(prisma.category.deleteMany).not.toHaveBeenCalled();
        });

        it('should delete multiple orphaned categories in a single call', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue({
                mainCategoryId: 'cat-1-uuid',
                categories: [{ id: 'cat-2-uuid' }, { id: 'cat-3-uuid' }],
            });
            (prisma.product.delete as jest.Mock).mockResolvedValue(mockProduct);
            (prisma.category.findMany as jest.Mock).mockResolvedValue([
                { id: 'cat-1-uuid' },
                { id: 'cat-2-uuid' },
                { id: 'cat-3-uuid' },
            ]);
            const token = adminToken();

            const res = await request(app)
                .delete(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(prisma.category.deleteMany).toHaveBeenCalledTimes(1);
            expect(prisma.category.deleteMany).toHaveBeenCalledWith({
                where: {
                    id: { in: ['cat-1-uuid', 'cat-2-uuid', 'cat-3-uuid'] },
                },
            });
        });

        it('should deduplicate when mainCategory is also in categories list', async () => {
            (prisma.product.findUnique as jest.Mock).mockResolvedValue({
                mainCategoryId: 'cat-same-uuid',
                categories: [{ id: 'cat-same-uuid' }],
            });
            (prisma.product.delete as jest.Mock).mockResolvedValue(mockProduct);
            (prisma.category.findMany as jest.Mock).mockResolvedValue([]);
            const token = adminToken();

            await request(app)
                .delete(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`);

            // Candidate ids are deduped before the recompute query.
            expect(prisma.category.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        id: { in: ['cat-same-uuid'] },
                    }),
                }),
            );
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).delete(
                `/api/products/${mockProduct.id}`,
            );

            expect(res.status).toBe(401);
        });

        it('should return 403 when authenticated as customer', async () => {
            const token = customerToken();

            const res = await request(app)
                .delete(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(403);
        });
    });
});
