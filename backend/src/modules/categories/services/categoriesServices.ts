import { prisma } from '../../../lib/prisma';
import { normalizeName } from '../../../lib/utils';

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
            name: normalizeName(name),
        },
    });

    if (!category) throw new Error('Category not found');

    await prisma.product.updateMany({
        where: { mainCategoryId: category.id },
        data: { mainCategoryId: null },
    });

    const deletedCategory = await prisma.category.delete({
        where: {
            name: normalizeName(name),
        },
    });

    return deletedCategory;
};

export default { getAllCategories, deleteCategoryByName };
