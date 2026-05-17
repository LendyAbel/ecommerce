import { prisma } from '../../../lib/prisma';
import { normalizeName } from '../../../lib/utils';
import { ProductCrateInput } from '../productTypes';

const productInclude = {
    images: true,
    mainCategory: true,
    categories: true,
} as const;

const getAllProducts = async () => {
        return prisma.product.findMany({ include: productInclude });
};

const getProductById = async (id: string) => {
    return prisma.product.findUnique({
        where: { id },
        include: productInclude,
    });
};

const addNewProduct = async (data: ProductCrateInput) => {
    return prisma.product.create({
        data: {
            sku: data.sku,
            name: data.name,
            shortDescription: data.shortDescription,
            longDescription: data.longDescription,
            brand: data.brand,
            price: data.price,
            tax: data.tax,
            stock: data.stock,
            status: data.status,

            // connect or create category
            mainCategory: data.mainCategory
                ? {
                      connectOrCreate: {
                          where: {
                              name: normalizeName(data.mainCategory),
                          },
                          create: {
                              name: normalizeName(data.mainCategory),
                          },
                      },
                  }
                : undefined,

            categories: {
                connectOrCreate: data.categories.map(name => ({
                    where: { name: normalizeName(name) },
                    create: { name: normalizeName(name) },
                })),
            },

            images: {
                create: data.images,
            },
        },
        include: productInclude,
    });
};

const deleteProductById = async (id: string) => {
    const product = await prisma.product.findUnique({
        where: { id },
        select: {
            mainCategoryId: true,
            categories: { select: { id: true } },
        },
    });

    if (!product) return null;

    const categoryIds = new Set<string>();
    if (product.mainCategoryId) categoryIds.add(product.mainCategoryId);
    for (const cat of product.categories) categoryIds.add(cat.id);

    const deleted = await prisma.product.delete({
        where: { id },
        include: productInclude,
    });

    for (const categoryId of categoryIds) {
        const remaining = await prisma.product.count({
            where: {
                OR: [
                    { mainCategoryId: categoryId },
                    { categories: { some: { id: categoryId } } },
                ],
            },
        });
        if (remaining === 0) {
            await prisma.category.delete({ where: { id: categoryId } });
        }
    }

    return deleted;
};

export default {
    getAllProducts,
    addNewProduct,
    deleteProductById,
    getProductById,
};
