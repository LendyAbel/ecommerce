import { AppError } from '../../../lib/AppError';
import { prisma } from '../../../lib/prisma';
import {
    CreateAddressInput,
    UpdateAddressInput,
} from '../schemas/addressSchemas';

const listAddresses = async (userId: string) => {
    return prisma.address.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
};

const createAddress = async (userId: string, data: CreateAddressInput) => {
    return prisma.address.create({
        data: { ...data, user: { connect: { id: userId } } },
    });
};

const updateAddress = async (
    userId: string,
    addressId: string,
    data: UpdateAddressInput,
) => {
    const existing = await prisma.address.findFirst({
        where: { userId, id: addressId },
    });
    if (!existing) throw new AppError('Address not found', 404);
    return prisma.address.update({
        where: { id: addressId },
        data,
    });
};

const deleteAddress = async (userId: string, addressId: string) => {
    const result = await prisma.address.deleteMany({
        where: { userId, id: addressId },
    });
    if (result.count === 0) throw new AppError('Address not found', 404);
};

export default { listAddresses, createAddress, updateAddress, deleteAddress };
