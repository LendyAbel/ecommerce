import bcrypt from 'bcrypt';

import { AppError } from '../../../lib/AppError';
import { prisma } from '../../../lib/prisma';
import { LoginInput, RegisterInput } from '../schemas/authSchemas';
import { getToken } from '../utils/utils';

const SALT_ROUNDS = 10;

const register = async (data: RegisterInput) => {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
        },
    });

    const token = getToken({ userId: user.id, role: user.role });
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};

const login = async (data: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });

    // El deleteAr es un guard defensivo en caso de que en soft-deleted falle la
    // reescritura del correo del usuario borrado
    if (!user || user.deletedAt) throw new AppError('Invalid credentials', 401);

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new AppError('Invalid credentials', 401);

    const token = getToken({ userId: user.id, role: user.role });
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};

const getUserById = async (userId: string) => {
    const user = await prisma.user.findFirst({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!user) throw new AppError('User not found', 404);

    return { user };
};

export default { register, login, getUserById };
