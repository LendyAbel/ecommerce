import { AppError } from '../../../lib/AppError';
import { prisma } from '../../../lib/prisma';
import { serializeCart } from '../../../lib/serializers';
import { AddItemInput, UpdateItemInput } from '../schemas/cartZodSchema';

const cartInclude = {
    cartItems: {
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
};

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
    });
    if (!product) throw new AppError('Product not found', 404);

    const cart = await getOrCreateCart(userId);
    const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: data.productId },
    });

    if (existing) {
        await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + data.quantity },
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: data.productId,
                quantity: data.quantity,
            },
        });
    }

    return fetchCart(userId);
};

const updateItem = async (
    userId: string,
    itemId: string,
    data: UpdateItemInput,
) => {
    const item = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
    });
    if (!item || item.cart.userId !== userId)
        throw new AppError('Item not found', 404);

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
