import { AppError } from '../../../lib/AppError';
import { prisma } from '../../../lib/prisma';

const getAllCategories = async () => {
    // _count makes Postgres count the relations server-side instead of shipping
    // every related product id back just to take its array length.
    const categories = await prisma.category.findMany({
        include: {
            _count: { select: { products: true, mainProducts: true } },
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
