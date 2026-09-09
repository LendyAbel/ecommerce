import bcrypt from 'bcrypt';

import { AppError } from '../../../lib/AppError';
import { prisma } from '../../../lib/prisma';
import {
    ChangePasswordInput,
    LoginInput,
    RegisterInput,
    UpdateProfileInput,
} from '../schemas/authSchemas';
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

const PROFILE_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
} as const;

const getUserById = async (userId: string) => {
    const user = await prisma.user.findFirst({
        where: { id: userId },
        select: PROFILE_SELECT,
    });

    if (!user) throw new AppError('User not found', 404);

    return { user };
};

// Unique email conflicts surface as Prisma P2002, mapped to 409 by errorHandler.
const updateProfile = async (userId: string, data: UpdateProfileInput) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: PROFILE_SELECT,
    });

    return { user };
};

const changePassword = async (userId: string, data: ChangePasswordInput) => {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const isPasswordValid = await bcrypt.compare(
        data.currentPassword,
        user.password,
    );
    if (!isPasswordValid) throw new AppError('Current password is incorrect', 401);

    const hashedPassword = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
};

export default {
    register,
    login,
    getUserById,
    updateProfile,
    changePassword,
};
