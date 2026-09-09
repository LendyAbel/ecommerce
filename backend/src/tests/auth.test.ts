import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '../app';

// --- Mocks ---
jest.mock('../lib/prisma', () => ({
    prisma: {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn(),
}));

import bcrypt from 'bcrypt';

import { prisma } from '../lib/prisma';

// --- Helpers ---
const mockUser = {
    id: 'user-uuid-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'customer',
    createdAt: new Date(),
    updatedAt: new Date(),
};

const validToken = () =>
    jwt.sign(
        { userId: mockUser.id, role: mockUser.role },
        process.env.JWT_SECRET!,
    );

// --- Tests ---
describe('Auth', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user and return 201', async () => {
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app).post('/api/auth/register').send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });

            expect(res.status).toBe(201);
            expect(res.body.user).toMatchObject({
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
            });
            expect(res.body.user).not.toHaveProperty('password');
        });

        it('should return 400 when email is invalid', async () => {
            const res = await request(app).post('/api/auth/register').send({
                name: 'Test',
                email: 'not-an-email',
                password: 'password123',
            });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error', 'Validation error');
        });

        it('should return 400 when name is missing', async () => {
            const res = await request(app).post('/api/auth/register').send({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(res.status).toBe(400);
        });

        it('should return 400 when password is missing', async () => {
            const res = await request(app).post('/api/auth/register').send({
                name: 'Test',
                email: 'test@example.com',
            });

            expect(res.status).toBe(400);
        });

        it('should hash the password before saving', async () => {
            (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

            await request(app).post('/api/auth/register').send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            });

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials and set cookie', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                ...mockUser,
                password: 'hashed_password',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const res = await request(app).post('/api/auth/login').send({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(res.status).toBe(200);
            expect(res.body.user).toMatchObject({ email: mockUser.email });
            expect(res.body.user).not.toHaveProperty('password');
            expect(res.headers['set-cookie']).toBeDefined();
            expect((res.headers['set-cookie'] as unknown as string[])[0]).toMatch(/token=/);
        });

        it('should return 401 when user does not exist', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await request(app).post('/api/auth/login').send({
                email: 'nonexistent@example.com',
                password: 'password123',
            });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid credentials');
        });

        it('should return 401 when password is wrong', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                ...mockUser,
                password: 'hashed_password',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const res = await request(app).post('/api/auth/login').send({
                email: 'test@example.com',
                password: 'wrong-password',
            });

            expect(res.status).toBe(401);
        });

        it('should return 400 when email is missing', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ password: 'password123' });

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should clear the token cookie and return 200', async () => {
            const res = await request(app).post('/api/auth/logout');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Logged out');
            const cookies = res.headers['set-cookie'] as string[] | undefined;
            const tokenCookie = cookies?.find((c) => c.startsWith('token='));
            expect(tokenCookie).toMatch(/token=;/);
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return logged user when token is valid', async () => {
            // /me loads the user via findFirst (soft-delete extension injects deletedAt: null).
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
            const token = validToken();

            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(res.body.user).toMatchObject({ email: mockUser.email });
            expect(res.body.user).not.toHaveProperty('password');
        });

        it('should return 401 when no cookie is present', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.status).toBe(401);
        });

        it('should return 401 when token is invalid', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', 'token=invalid.token.here');

            expect(res.status).toBe(401);
        });

        it('should return 404 when token is valid but user no longer exists', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
            const token = validToken();

            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /api/auth/me', () => {
        it('should update name/email and return the updated user', async () => {
            const updated = { ...mockUser, name: 'New Name', email: 'new@example.com' };
            (prisma.user.update as jest.Mock).mockResolvedValue(updated);
            const token = validToken();

            const res = await request(app)
                .patch('/api/auth/me')
                .set('Cookie', `token=${token}`)
                .send({ name: 'New Name', email: 'new@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.user).toMatchObject({
                name: 'New Name',
                email: 'new@example.com',
            });
            expect(res.body.user).not.toHaveProperty('password');
        });

        it('should return 401 when no cookie is present', async () => {
            const res = await request(app)
                .patch('/api/auth/me')
                .send({ name: 'New Name', email: 'new@example.com' });

            expect(res.status).toBe(401);
        });

        it('should return 400 when email is invalid', async () => {
            const token = validToken();

            const res = await request(app)
                .patch('/api/auth/me')
                .set('Cookie', `token=${token}`)
                .send({ name: 'New Name', email: 'not-an-email' });

            expect(res.status).toBe(400);
        });
    });

    describe('PATCH /api/auth/me/password', () => {
        it('should change the password when current password is correct', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue({
                ...mockUser,
                password: 'hashed_password',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
            const token = validToken();

            const res = await request(app)
                .patch('/api/auth/me/password')
                .set('Cookie', `token=${token}`)
                .send({ currentPassword: 'password123', newPassword: 'newpassword123' });

            expect(res.status).toBe(200);
            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
        });

        it('should return 401 when current password is wrong', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue({
                ...mockUser,
                password: 'hashed_password',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            const token = validToken();

            const res = await request(app)
                .patch('/api/auth/me/password')
                .set('Cookie', `token=${token}`)
                .send({ currentPassword: 'wrong-password', newPassword: 'newpassword123' });

            expect(res.status).toBe(401);
        });

        it('should return 400 when new password is too short', async () => {
            const token = validToken();

            const res = await request(app)
                .patch('/api/auth/me/password')
                .set('Cookie', `token=${token}`)
                .send({ currentPassword: 'password123', newPassword: 'short' });

            expect(res.status).toBe(400);
        });
    });
});
