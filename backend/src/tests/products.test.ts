import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';

// --- Mocks ---
jest.mock('../lib/prisma', () => ({
    prisma: {
        product: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
        category: {
            findUnique: jest.fn(),
        },
    },
}));

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
    describe('GET /api/products', () => {
        it('should return all products with status 200', async () => {
            (prisma.product.findMany as jest.Mock).mockResolvedValue([
                mockProduct,
            ]);

            const res = await request(app).get('/api/products');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toMatchObject({ sku: mockProduct.sku });
        });

        it('should return empty array when no products exist', async () => {
            (prisma.product.findMany as jest.Mock).mockResolvedValue([]);

            const res = await request(app).get('/api/products');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should not require authentication', async () => {
            (prisma.product.findMany as jest.Mock).mockResolvedValue([]);

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

    describe('DELETE /api/products/:id', () => {
        it('should delete a product when admin is authenticated', async () => {
            (prisma.product.delete as jest.Mock).mockResolvedValue(mockProduct);
            const token = adminToken();

            const res = await request(app)
                .delete(`/api/products/${mockProduct.id}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ id: mockProduct.id });
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
