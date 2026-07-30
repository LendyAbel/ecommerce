import { Prisma } from '../../../../prisma/generated/prisma/client';
import { prisma } from '../../../lib/prisma';
import { serializeProduct } from '../../../lib/serializers';
import { normalizeName } from '../../../lib/utils';
import {
    ProductCrateInput,
    ProductQuery,
    ProductUpdateInput,
} from '../schemas/productsSchemas';

const productInclude = {
    images: true,
    mainCategory: true,
    categories: true,
} as const;

const getAllProducts = async (filters: Partial<ProductQuery> = {}) => {
    const { search, category, sortBy, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const conditions: Prisma.ProductWhereInput[] = [];

    if (search) {
        conditions.push({
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { shortDescription: { contains: search, mode: 'insensitive' } },
                { longDescription: { contains: search, mode: 'insensitive' } },
                { brand: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ],
        });
    }

    if (category) {
        // Matches either the product's mainCategory or any of its M-N categories.
        conditions.push({
            OR: [
                { mainCategory: { name: { equals: category, mode: 'insensitive' } } },
                {
                    categories: {
                        some: { name: { equals: category, mode: 'insensitive' } },
                    },
                },
            ],
        });
    }

    const where: Prisma.ProductWhereInput = conditions.length
        ? { AND: conditions }
        : {};

    // id is a deterministic tiebreaker so pagination is stable across pages.
    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
        sortBy === 'price_asc' ? [{ price: 'asc' }, { id: 'asc' }]
        : sortBy === 'price_desc' ? [{ price: 'desc' }, { id: 'asc' }]
        : sortBy === 'oldest' ? [{ createdAt: 'asc' }, { id: 'asc' }]
        : [{ createdAt: 'desc' }, { id: 'asc' }];

    const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            orderBy,
            skip: offset,
            take: limit,
            include: productInclude,
        }),
    ]);

    return { data: products.map(serializeProduct), total, page, limit };
};

const getProductById = async (id: string) => {
    const product = await prisma.product.findUnique({
        where: { id },
        include: productInclude,
    });
    return product ? serializeProduct(product) : null;
};

const addNewProduct = async (data: ProductCrateInput) => {
    const product = await prisma.product.create({
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
    return serializeProduct(product);
};

const updateProduct = async (id: string, data: ProductUpdateInput) => {
    // PATCH semantics: only the keys present in `data` are touched. Scalars are
    // copied through as-is; relations (categories/images/mainCategory) are
    // fully replaced when provided.
    const updateData: Prisma.ProductUpdateInput = {};

    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.shortDescription !== undefined)
        updateData.shortDescription = data.shortDescription;
    if (data.longDescription !== undefined)
        updateData.longDescription = data.longDescription;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.tax !== undefined) updateData.tax = data.tax;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.status !== undefined) updateData.status = data.status;

    if (data.mainCategory !== undefined) {
        updateData.mainCategory = {
            connectOrCreate: {
                where: { name: normalizeName(data.mainCategory) },
                create: { name: normalizeName(data.mainCategory) },
            },
        };
    }

    if (data.categories !== undefined) {
        // Replace the whole M-N set: clear existing links, then connect/create.
        updateData.categories = {
            set: [],
            connectOrCreate: data.categories.map(name => ({
                where: { name: normalizeName(name) },
                create: { name: normalizeName(name) },
            })),
        };
    }

    if (data.images !== undefined) {
        // Replace all images for this product.
        updateData.images = {
            deleteMany: {},
            create: data.images,
        };
    }

    const product = await prisma.product.update({
        where: { id },
        data: updateData,
        include: productInclude,
    });
    return serializeProduct(product);
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

    return prisma.$transaction(async tx => {
        const deleted = await tx.product.delete({
            where: { id },
            include: productInclude,
        });

        if (categoryIds.size) {
            // Single query: of the candidate categories, find the ones now left
            // with no product referencing them (neither as main nor M-N), instead
            // of running one count() per category.
            const orphans = await tx.category.findMany({
                where: {
                    id: { in: [...categoryIds] },
                    products: { none: {} },
                    mainProducts: { none: {} },
                },
                select: { id: true },
            });

            if (orphans.length) {
                await tx.category.deleteMany({
                    where: { id: { in: orphans.map(cat => cat.id) } },
                });
            }
        }

        return serializeProduct(deleted);
    });
};

export default {
    getAllProducts,
    addNewProduct,
    updateProduct,
    deleteProductById,
    getProductById,
};
