import { prisma } from '../../../lib/prisma';
import { normalizeName } from '../../../lib/utils';
import { ProductCrateInput, ProductQuery } from '../productTypes';

const productInclude = {
    images: true,
    mainCategory: true,
    categories: true,
} as const;

const getAllProducts = async (filters: ProductQuery = {}) => {
    const { search, category, sortBy } = filters;

    const andConditions: object[] = [];

    if (search) {
        const pattern = `%${search}%`;
        const matches = await prisma.$queryRaw<{ id: string }[]>`
            SELECT id FROM "Product"
            WHERE unaccent(name) ILIKE unaccent(${pattern})
               OR unaccent(brand) ILIKE unaccent(${pattern})
               OR unaccent("shortDescription") ILIKE unaccent(${pattern})
        `;
        andConditions.push({ id: { in: matches.map(m => m.id) } });
    }

    if (category) {
        andConditions.push({
            OR: [
                { mainCategory: { name: { equals: category, mode: 'insensitive' } } },
                { categories: { some: { name: { equals: category, mode: 'insensitive' } } } },
            ],
        });
    }

    const orderBy =
        sortBy === 'price_asc' ? { price: 'asc' as const }
        : sortBy === 'price_desc' ? { price: 'desc' as const }
        : sortBy === 'oldest' ? { createdAt: 'asc' as const }
        : { createdAt: 'desc' as const };

    return prisma.product.findMany({
        where: andConditions.length ? { AND: andConditions } : {},
        orderBy,
        include: productInclude,
    });
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
