import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginInput, RegisterInput } from '../schemas/authZodSchema';
import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../lib/AppError';
import { config } from '../../../lib/config';

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
    // A soft-deleted user has its email rewritten, so findUnique won't match it.
    // The deletedAt guard is a defensive backstop in case any delete path skips that.
    if (!user || user.deletedAt) throw new AppError('Invalid credentials', 401);

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) throw new AppError('Invalid credentials', 401);

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.JWT_SECRET,
        { expiresIn: '7d' },
    );
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};

// The JWT is already verified by the `authenticate` middleware, which puts the
// userId on req.user. This just loads the current user record by id.
const getUserById = async (userId: string) => {
    // findFirst (not findUnique) so the soft-delete extension injects deletedAt: null.
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
