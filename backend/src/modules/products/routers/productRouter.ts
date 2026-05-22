import express from 'express';
import productServices from '../services/productServices';
import { ProductCreateSchema, ProductQuerySchema } from '../schemas/productsZodSchema';
import { AppError } from '../../../lib/AppError';
import {
    authenticate,
    requireAdmin,
} from '../../../middlewares/authMiddleware';
import { getParam } from '../../../lib/utils';

const router = express.Router();

//Obtener todos los productos
router.get('/', async (req, res) => {
    const filters = ProductQuerySchema.parse(req.query);
    const products = await productServices.getAllProducts(filters);
    res.status(200).json(products);
});

//Obtener un producto por su ID
router.get('/:id', async (req, res) => {
    const product = await productServices.getProductById(req.params.id);
    if (!product) throw new AppError('Product not found', 404);
    res.status(200).json(product);
});

//Crear un nuevo producto
router.post('/', authenticate, requireAdmin, async (req, res) => {
    const data = ProductCreateSchema.parse(req.body);
    const newProduct = await productServices.addNewProduct(data);
    res.status(201).json(newProduct);
});

//Borrar un producto existente
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    const id = getParam(req.params['id']);
    if (!id) throw new AppError('Product ID is required', 400);

    const deletedProduct = await productServices.deleteProductById(id);
    res.status(200).json(deletedProduct);
});

export default router;
