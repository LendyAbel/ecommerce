import { prisma } from '../../../lib/prisma';

const getAllCategories = async () => {
    const categories = await prisma.category.findMany({
        include: {
            products: { select: { id: true } },
            mainProducts: { select: { id: true } },
        },
    });
    return categories;
};

const deleteCategoryByName = async (name: string) => {
    const category = await prisma.category.findUnique({
        where: {
            name,
        },
        include: {
            products: true,
            mainProducts: true,
        },
    });

    if (!category) throw new Error('Category not found');

    await prisma.product.updateMany({
        where: {
            categories: {
                some: { name },
            },
        },
        data: {},
    });
    await prisma.product.updateMany({
        where: { mainCategoryId: category.id },
        data: { mainCategoryId: null },
    });

    await prisma.category.delete({
        where: {
            name,
        },
    });
};

export default { getAllCategories, deleteCategoryByName };
