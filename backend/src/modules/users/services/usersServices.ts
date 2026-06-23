import { prisma } from '../../../lib/prisma';
import { AppError } from '../../../lib/AppError';

const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
} as const;

// List active users. The soft-delete extension auto-excludes `deletedAt` rows on findMany.
const listUsers = async () => {
    return prisma.user.findMany({
        select: USER_SELECT,
        orderBy: { createdAt: 'desc' },
    });
};

// Soft delete: we never DELETE the user row (orders reference it). Instead we mark it
// with `deletedAt` and free the unique email so it can be reused for a fresh
// registration. The original email is preserved inside the rewritten value for auditing.
// The cart is ephemeral, so we drop it. findFirst goes through the soft-delete extension,
// so an already-deleted user resolves to null → 404, preventing a double delete.
const softDeleteUser = async (userId: string) => {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    await prisma.$transaction([
        prisma.cart.deleteMany({ where: { userId } }),
        prisma.user.update({
            where: { id: userId },
            data: {
                deletedAt: new Date(),
                email: `deleted#${user.id}#${user.email}`,
            },
        }),
    ]);
};

export default { listUsers, softDeleteUser };
