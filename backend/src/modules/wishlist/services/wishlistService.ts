import { Prisma } from '../../../../prisma/generated/prisma/client';
import { AppError } from '../../../lib/AppError';
import { prisma } from '../../../lib/prisma';
import { serializeWishlist } from '../../../lib/serializers';
import { AddItemInput } from '../schemas/wishlistSchemas';

const wishlistInclude = {
    wishItems: {
        include: {
            product: {
                include: { images: true },
            },
        },
    },
} satisfies Prisma.WishListInclude;

const fetchWishlist = async (userId: string) => {
    const wishlist = await prisma.wishList.findUnique({
        where: { userId },
        include: wishlistInclude,
    });
    return wishlist ? serializeWishlist(wishlist) : null;
};

const getOrCreateWishlist = async (userId: string) => {
    const wishlist = await prisma.wishList.upsert({
        where: { userId },
        update: {},
        create: { userId },
        include: wishlistInclude,
    });
    return serializeWishlist(wishlist);
};

const addItem = async (userId: string, data: AddItemInput) => {
    const product = await prisma.product.findUnique({
        where: { id: data.productId },
    });
    if (!product) throw new AppError('Product not found', 404);

    const wishlist = await getOrCreateWishlist(userId);
    await prisma.wishItem.upsert({
        where: {
            wishlistId_productId: {
                wishlistId: wishlist.id,
                productId: data.productId,
            },
        },
        update: {},
        create: { wishlistId: wishlist.id, productId: data.productId },
    });

    return fetchWishlist(userId);
};

const removeItem = async (userId: string, productId: string) => {
    const item = await prisma.wishItem.findFirst({
        where: { productId, wishlist: { userId } },
    });
    if (!item) throw new AppError('Item not found', 404);

    await prisma.wishItem.delete({ where: { id: item.id } });
    return fetchWishlist(userId);
};

const isInWishlist = async (userId: string, productId: string) => {
    const item = await prisma.wishItem.findFirst({
        where: { productId, wishlist: { userId } },
        select: { id: true },
    });
    return Boolean(item);
};

export default {
    fetchWishlist,
    getOrCreateWishlist,
    addItem,
    removeItem,
    isInWishlist,
};
