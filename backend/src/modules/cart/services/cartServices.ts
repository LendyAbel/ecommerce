import { Prisma } from '../../../../prisma/generated/prisma/client';
import { AppError } from '../../../lib/AppError';
import { prisma } from '../../../lib/prisma';
import { serializeCart } from '../../../lib/serializers';
import { AddItemInput, UpdateItemInput } from '../schemas/cartZodSchema';

const cartInclude = {
    cartItems: {
        orderBy: { createdAt: 'asc' },
        include: {
            product: {
                include: {
                    images: true,
                    mainCategory: true,
                    categories: true,
                },
            },
        },
    },
} satisfies Prisma.CartInclude;

const fetchCart = async (userId: string) => {
    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: cartInclude,
    });
    return cart ? serializeCart(cart) : null;
};

const getOrCreateCart = async (userId: string) => {
    const cart = await prisma.cart.upsert({
        where: { userId },
        update: {},
        create: { userId },
        include: cartInclude,
    });
    return serializeCart(cart);
};

const addItem = async (userId: string, data: AddItemInput) => {
    const product = await prisma.product.findUnique({
        where: { id: data.productId },
        select: { stock: true },
    });
    if (!product) throw new AppError('Product not found', 404);

    const cart = await getOrCreateCart(userId);

    // The @@unique([cartId, productId]) constraint lets us collapse the old
    // find-then-create/update into a single atomic upsert: insert the row or
    // increment its quantity in one statement. Wrapped in a transaction so the
    // stock check and the write commit (or roll back) together.
    await prisma.$transaction(async tx => {
        const item = await tx.cartItem.upsert({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: data.productId,
                },
            },
            create: {
                cartId: cart.id,
                productId: data.productId,
                quantity: data.quantity,
            },
            update: { quantity: { increment: data.quantity } },
            select: { quantity: true },
        });

        if (item.quantity > product.stock) {
            throw new AppError('Not enough stock', 409);
        }
    });
    return fetchCart(userId);
};

const updateItem = async (
    userId: string,
    itemId: string,
    data: UpdateItemInput,
) => {
    const item = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true, product: { select: { stock: true } } },
    });
    if (!item || item.cart.userId !== userId)
        throw new AppError('Item not found', 404);

    if (data.quantity > item.product.stock) {
        throw new AppError('Not enough stock', 409);
    }
    if (data.quantity <= 0) {
        return removeItem(userId, itemId);
    }

    await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: data.quantity },
    });
    return fetchCart(userId);
};

const removeItem = async (userId: string, itemId: string) => {
    const item = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
    });
    if (!item || item.cart.userId !== userId)
        throw new AppError('Item not found', 404);

    await prisma.cartItem.delete({ where: { id: itemId } });
    return fetchCart(userId);
};

const clearCart = async (userId: string) => {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new AppError('Cart not found', 404);

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return fetchCart(userId);
};

export default { getOrCreateCart, addItem, updateItem, removeItem, clearCart };
