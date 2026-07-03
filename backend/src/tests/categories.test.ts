import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '../app';

// --- Mocks ---
jest.mock('../lib/prisma', () => ({
    prisma: {
        category: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
        product: {
            updateMany: jest.fn(),
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

// --- Data ---
const mockCategory = {
    id: 'cat-uuid-123',
    name: 'electronica',
    _count: { products: 0, mainProducts: 0 },
};

// --- Tests ---
describe('Categories', () => {
    describe('GET /api/categories', () => {
        it('should return all categories with status 200', async () => {
            (prisma.category.findMany as jest.Mock).mockResolvedValue([
                mockCategory,
            ]);

            const res = await request(app).get('/api/categories');

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(1);
            expect(res.body[0]).toMatchObject({ name: mockCategory.name });
        });

        it('should return empty array when no categories exist', async () => {
            (prisma.category.findMany as jest.Mock).mockResolvedValue([]);

            const res = await request(app).get('/api/categories');

            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });

        it('should not require authentication', async () => {
            (prisma.category.findMany as jest.Mock).mockResolvedValue([]);

            const res = await request(app).get('/api/categories');

            expect(res.status).toBe(200);
        });
    });

    describe('DELETE /api/categories/:name', () => {
        it('should delete a category by name', async () => {
            (prisma.category.findUnique as jest.Mock).mockResolvedValue(
                mockCategory,
            );
            (prisma.product.updateMany as jest.Mock).mockResolvedValue({
                count: 0,
            });
            (prisma.category.delete as jest.Mock).mockResolvedValue(
                mockCategory,
            );

            const res = await request(app)
                .delete('/api/categories/electronica')
                .set('Cookie', `token=${adminToken()}`);

            expect(res.status).toBe(200);
        });

        it('should normalize name (uppercase, accents) before deleting', async () => {
            (prisma.category.findUnique as jest.Mock).mockResolvedValue(
                mockCategory,
            );
            (prisma.product.updateMany as jest.Mock).mockResolvedValue({
                count: 0,
            });
            (prisma.category.delete as jest.Mock).mockResolvedValue(
                mockCategory,
            );

            const res = await request(app)
                .delete('/api/categories/ELECTR%C3%93NICA')
                .set('Cookie', `token=${adminToken()}`);

            expect(res.status).toBe(200);
            expect(prisma.category.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { name: 'electronica' },
                }),
            );
        });

        it('should return 404 when category does not exist', async () => {
            (prisma.category.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .delete('/api/categories/non-existent')
                .set('Cookie', `token=${adminToken()}`);

            expect(res.status).toBe(404);
        });

        it('should return 400 when name is empty', async () => {
            const res = await request(app)
                .delete('/api/categories/%20')
                .set('Cookie', `token=${adminToken()}`);

            // The :name param is now validated with Zod, so an empty/whitespace
            // name surfaces as the standard validation-error shape.
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation error');
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).delete('/api/categories/electronica');

            expect(res.status).toBe(401);
        });

        it('should return 403 when authenticated user is not admin', async () => {
            const res = await request(app)
                .delete('/api/categories/electronica')
                .set('Cookie', `token=${customerToken()}`);

            expect(res.status).toBe(403);
        });
    });
});
