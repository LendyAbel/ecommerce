import jwt from 'jsonwebtoken';
import request from 'supertest';

import app from '../app';

// --- Mocks ---
jest.mock('../lib/prisma', () => {
    const prismaMock = {
        address: {
            findMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            deleteMany: jest.fn(),
        },
    };
    return { prisma: prismaMock };
});

import { prisma } from '../lib/prisma';

// --- Helpers ---
const USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const ADDRESS_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

const customerToken = () =>
    jwt.sign({ userId: USER_ID, role: 'customer' }, process.env.JWT_SECRET!);

const validAddressBody = {
    fullName: 'Jane Doe',
    phone: '600000000',
    line1: 'Main St 1',
    city: 'Madrid',
    postalCode: '28001',
    country: 'ES',
};

const mockAddress = {
    id: ADDRESS_ID,
    userId: USER_ID,
    ...validAddressBody,
    line2: null,
    state: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

// --- Tests ---
describe('Addresses', () => {
    describe('GET /api/addresses', () => {
        it('should return the address book of the authenticated user with status 200', async () => {
            (prisma.address.findMany as jest.Mock).mockResolvedValue([
                mockAddress,
            ]);
            const token = customerToken();

            const res = await request(app)
                .get('/api/addresses')
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(prisma.address.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { userId: USER_ID } }),
            );
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).get('/api/addresses');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/addresses', () => {
        it('should create a new address with status 201', async () => {
            (prisma.address.create as jest.Mock).mockResolvedValue(
                mockAddress,
            );
            const token = customerToken();

            const res = await request(app)
                .post('/api/addresses')
                .set('Cookie', `token=${token}`)
                .send(validAddressBody);

            expect(res.status).toBe(201);
            expect(res.body).toMatchObject({ id: ADDRESS_ID });
            expect(prisma.address.create).toHaveBeenCalledWith({
                data: {
                    ...validAddressBody,
                    user: { connect: { id: USER_ID } },
                },
            });
        });

        it('should return 400 when a required field is missing', async () => {
            const token = customerToken();
            const { fullName: _fullName, ...incomplete } = validAddressBody;

            const res = await request(app)
                .post('/api/addresses')
                .set('Cookie', `token=${token}`)
                .send(incomplete);

            expect(res.status).toBe(400);
            expect(prisma.address.create).not.toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .post('/api/addresses')
                .send(validAddressBody);

            expect(res.status).toBe(401);
        });
    });

    describe('PATCH /api/addresses/:id', () => {
        it('should update an existing address', async () => {
            (prisma.address.findFirst as jest.Mock).mockResolvedValue(
                mockAddress,
            );
            (prisma.address.update as jest.Mock).mockResolvedValue({
                ...mockAddress,
                city: 'Barcelona',
            });
            const token = customerToken();

            const res = await request(app)
                .patch(`/api/addresses/${ADDRESS_ID}`)
                .set('Cookie', `token=${token}`)
                .send({ city: 'Barcelona' });

            expect(res.status).toBe(200);
            expect(res.body).toMatchObject({ city: 'Barcelona' });
            expect(prisma.address.update).toHaveBeenCalledWith({
                where: { id: ADDRESS_ID },
                data: { city: 'Barcelona' },
            });
        });

        it('should return 404 when the address does not belong to the user', async () => {
            (prisma.address.findFirst as jest.Mock).mockResolvedValue(null);
            const token = customerToken();

            const res = await request(app)
                .patch(`/api/addresses/${ADDRESS_ID}`)
                .set('Cookie', `token=${token}`)
                .send({ city: 'Barcelona' });

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Address not found');
            expect(prisma.address.update).not.toHaveBeenCalled();
        });

        it('should return 400 when id is not a valid UUID', async () => {
            const token = customerToken();

            const res = await request(app)
                .patch('/api/addresses/not-a-uuid')
                .set('Cookie', `token=${token}`)
                .send({ city: 'Barcelona' });

            expect(res.status).toBe(400);
            expect(prisma.address.findFirst).not.toHaveBeenCalled();
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app)
                .patch(`/api/addresses/${ADDRESS_ID}`)
                .send({ city: 'Barcelona' });

            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/addresses/:id', () => {
        it('should delete the address and return 204', async () => {
            (prisma.address.deleteMany as jest.Mock).mockResolvedValue({
                count: 1,
            });
            const token = customerToken();

            const res = await request(app)
                .delete(`/api/addresses/${ADDRESS_ID}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(204);
            expect(prisma.address.deleteMany).toHaveBeenCalledWith({
                where: { userId: USER_ID, id: ADDRESS_ID },
            });
        });

        it('should return 404 when the address does not belong to the user', async () => {
            (prisma.address.deleteMany as jest.Mock).mockResolvedValue({
                count: 0,
            });
            const token = customerToken();

            const res = await request(app)
                .delete(`/api/addresses/${ADDRESS_ID}`)
                .set('Cookie', `token=${token}`);

            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'Address not found');
        });

        it('should return 401 when not authenticated', async () => {
            const res = await request(app).delete(
                `/api/addresses/${ADDRESS_ID}`,
            );

            expect(res.status).toBe(401);
        });
    });
});
