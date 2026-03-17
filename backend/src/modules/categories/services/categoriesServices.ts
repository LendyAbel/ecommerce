import { AppError } from '../../../lib/AppError';
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
    });

    if (!category) throw new AppError('Category not found', 404);

    await prisma.product.updateMany({
        where: { mainCategoryId: category.id },
        data: { mainCategoryId: null },
    });

    const deletedCategory = await prisma.category.delete({
        where: {
            name,
        },
    });

    return deletedCategory;
};

export default { getAllCategories, deleteCategoryByName };
