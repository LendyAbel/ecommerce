import { Prisma } from '../../../../generated/prisma/client';
import { prisma } from '../../../lib/prisma';
import { serializeProduct } from '../../../lib/serializers';
import { normalizeName } from '../../../lib/utils';
import { ProductCrateInput, ProductQuery, ProductUpdateInput } from '../productTypes';

const productInclude = {
    images: true,
    mainCategory: true,
    categories: true,
} as const;

// Turns a free-text search into a prefix tsquery ("lap top" -> "lap:* & top:*"),
// stripping any character that is a tsquery operator so user input can't break it.
const buildTsQuery = (search: string): string | null => {
    const terms = search
        .split(/\s+/)
        .map(term => term.replace(/[^\p{L}\p{N}]/gu, ''))
        .filter(Boolean);
    return terms.length ? terms.map(term => `${term}:*`).join(' & ') : null;
};

const getAllProducts = async (filters: Partial<ProductQuery> = {}) => {
    const { search, category, sortBy, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    const conditions: Prisma.Sql[] = [];

    const tsQuery = search ? buildTsQuery(search) : null;
    if (tsQuery) {
        conditions.push(
            Prisma.sql`p."searchVector" @@ to_tsquery('simple', f_unaccent(${tsQuery}))`,
        );
    }

    if (category) {
        // Matches either the product's mainCategory or any of its M-N categories.
        // "_ProductCategories" is Prisma's implicit join table (A=Category, B=Product).
        conditions.push(Prisma.sql`(
            EXISTS (
                SELECT 1 FROM "Category" mc
                WHERE mc.id = p."mainCategoryId" AND lower(mc.name) = lower(${category})
            )
            OR EXISTS (
                SELECT 1 FROM "_ProductCategories" pc
                JOIN "Category" c ON c.id = pc."A"
                WHERE pc."B" = p.id AND lower(c.name) = lower(${category})
            )
        )`);
    }

    const where = conditions.length
        ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
        : Prisma.empty;

    // p.id is a deterministic tiebreaker so pagination is stable across pages.
    const orderBy =
        sortBy === 'price_asc' ? Prisma.sql`p.price ASC, p.id ASC`
        : sortBy === 'price_desc' ? Prisma.sql`p.price DESC, p.id ASC`
        : sortBy === 'oldest' ? Prisma.sql`p."createdAt" ASC, p.id ASC`
        : Prisma.sql`p."createdAt" DESC, p.id ASC`;

    // One query: filtered + ordered + paginated ids, plus the full count via a
    // window function so we never load more than `limit` rows.
    const rows = await prisma.$queryRaw<{ id: string; total: bigint }[]>(Prisma.sql`
        SELECT p.id, count(*) OVER() AS total
        FROM "Product" p
        ${where}
        ORDER BY ${orderBy}
        LIMIT ${limit} OFFSET ${offset}
    `);

    const total = rows[0] ? Number(rows[0].total) : 0;
    const ids = rows.map(row => row.id);

    if (!ids.length) return { data: [], total, page, limit };

    // Hydrate the (bounded) id list with relations in a single query.
    const products = await prisma.product.findMany({
        where: { id: { in: ids } },
        include: productInclude,
    });

    // findMany with `IN` does not preserve order, so re-sort to match the ids.
    const byId = new Map(products.map(product => [product.id, product]));
    const data = ids
        .map(id => byId.get(id))
        .filter((product): product is NonNullable<typeof product> => Boolean(product))
        .map(serializeProduct);

    return { data, total, page, limit };
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
