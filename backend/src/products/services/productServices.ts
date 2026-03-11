import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';

const getAllProducts = async () => {
    const products = await prisma.product.findMany({
        include: {
            images: true,
            categories: true,
        },
    });
    return products;
};

const getProductById = async (id: string) => {
    const product = await prisma.product.findUnique({
        where: {
            id,
        },
        include: {
            images: true,
            categories: true,
        },
    });
    return product;
};

const addNewProduct = async (newProduct: Prisma.ProductCreateInput) => {
    const product = await prisma.product.create({
        data: newProduct,
        include: {
            images: true,
            categories: true,
        },
    });
    return product;
};

const deleteProductById = async (id: string) => {
    const product = await prisma.product.delete({
        where: {
            id,
        },
        include: {
            images: true,
            categories: true,
        },
    });
    return product;
};

export default { getAllProducts, addNewProduct, deleteProductById, getProductById };
