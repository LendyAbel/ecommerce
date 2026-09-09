import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '../app';

// --- Mocks ---
jest.mock('../lib/prisma', () => {
    const prismaMock = {
        user: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        cart: {
            deleteMany: jest.fn(),
        },
        $transaction: jest.fn(),
    };
    prismaMock.$transaction.mockImplementation((ops: Promise<unknown>[]) =>
        Promise.all(ops),
    );
    return { prisma: prismaMock };
});

import { prisma } from '../lib/prisma';

// --- Helpers ---
const USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

const adminToken = () =>
    jwt.sign({ userId: 'admin-uuid', role: 'admin' }, process.env.JWT_SECRET!);

const customerToken = () =>
    jwt.sign({ userId: USER_ID, role: 'customer' }, process.env.JWT_SECRET!);

const mockUser = {
    id: USER_ID,
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'customer',
    createdAt: new Date(),
    updatedAt: new Date(),
};

// --- Tests ---
describe('Users', () => {
    // resetMocks wipes the factory implementation before each test.
    beforeEach(() => {
        (prisma.$transaction as jest.Mock).mockImplementation(
            (ops: Promise<unknown>[]) => Promise.all(ops),
        );
    });

    describe('GET /api/users', () => {
        it('should return the list of users for an admin with status 200', async () => {
            (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser]);
            const token = adminToken();

            const res = await request(app)
                .get('/api/users')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({
                users: [{ id: USER_ID, email: mockUser.email }],
            });
            expect(prisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    select: expect.objectContaining({ email: true }),
                }),
            );
        });

        it('should return 403 when requested by a non-admin user', async () => {
            const token = customerToken();

            const res = await request(app)
                .get('/api/users')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(403);
            expect(prisma.user.findMany).not.toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get('/api/users');

            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('should soft-delete the user and return 204', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (prisma.cart.deleteMany as jest.Mock).mockResolvedValue({
                count: 1,
            });
            (prisma.user.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                deletedAt: new Date(),
            });
            const token = adminToken();

            const res = await request(app)
                .delete(`/api/users/${USER_ID}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(204);
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: USER_ID },
                    data: expect.objectContaining({
                        email: `deleted#${USER_ID}#${mockUser.email}`,
                    }),
                }),
            );
        });

        it('should return 404 when the user does not exist', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
            const token = adminToken();

            const res = await request(app)
                .delete(`/api/users/${USER_ID}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'User not found');
            expect(prisma.user.update).not.toHaveBeenCalled();
        });

        it('should return 403 when requested by a non-admin user', async () => {
            const token = customerToken();

            const res = await request(app)
                .delete(`/api/users/${USER_ID}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(403);
            expect(prisma.user.findFirst).not.toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).delete(`/api/users/${USER_ID}`);

            expect(res.status).toBe(401);
        });
    });
});
