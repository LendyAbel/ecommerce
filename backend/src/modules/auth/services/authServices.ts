import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginInput, RegisterInput } from '../schemas/authZodSchema';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../lib/AppError';

const SALT_ROUNDS = 10;

const register = async (data: RegisterInput) => {
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
    return user;
};

const login = async (data: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email,
        },
    });
    if (!user) throw new AppError('Invalid credentials', 401);

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new AppError('Invalid credentials', 401);

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' },
    );
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};

const getLoggedUser = async (token: string) => {
    let payload: { userId: string };
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
        };
    } catch {
        throw new AppError('Invalid or expired token', 401);
    }

    const user = await prisma.user.findUnique({
        where: {
            id: payload.userId,
        },
    });

    if (!user) throw new AppError('User not found', 404);
    const { password: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword };
};

export default { register, login, getLoggedUser };
