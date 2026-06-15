import { Request, Response } from 'express';
import productServices from '../services/productServices';
import {
    ProductCreateSchema,
    ProductQuerySchema,
    ProductUpdateSchema,
} from '../schemas/productsZodSchema';
import { AppError } from '../../../lib/AppError';
import { getParam } from '../../../lib/utils';

export const getAllProducts = async (req: Request, res: Response) => {
    const filters = ProductQuerySchema.parse(req.query);
    const products = await productServices.getAllProducts(filters);
    res.status(200).json(products);
};

export const getProductById = async (req: Request, res: Response) => {
    const id = getParam(req.params['id']);
    const product = await productServices.getProductById(id);
    if (!product) throw new AppError('Product not found', 404);
    res.status(200).json(product);
};

export const createProduct = async (req: Request, res: Response) => {
    const data = ProductCreateSchema.parse(req.body);
    const newProduct = await productServices.addNewProduct(data);
    res.status(201).json(newProduct);
};

export const updateProduct = async (req: Request, res: Response) => {
    const id = getParam(req.params['id']);
    const data = ProductUpdateSchema.parse(req.body);
    const updatedProduct = await productServices.updateProduct(id, data);
    res.status(200).json(updatedProduct);
};

export const deleteProduct = async (req: Request, res: Response) => {
    const id = getParam(req.params['id']);
    if (!id) throw new AppError('Product ID is required', 400);

    const deletedProduct = await productServices.deleteProductById(id);
    res.status(200).json(deletedProduct);
};
