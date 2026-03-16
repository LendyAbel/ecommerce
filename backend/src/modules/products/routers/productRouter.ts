import express from 'express';
import productServices from '../services/productServices';
import { ProductCreateSchema } from '../schemas/productsZodSchema';

const router = express.Router();

router.get('/', async (_req, res) => {
    const products = await productServices.getAllProducts();
    res.status(200).json(products);
});

router.get('/:id', async (req, res) => {
    const product = await productServices.getProductById(req.params.id);
    res.status(200).json(product);
});

router.post('/', async (req, res) => {
    const result = ProductCreateSchema.safeParse(req.body);
    if (!result.success) {
        res.status(400).json({
            error: 'Invalid data',
            issues: result.error.issues,
        });
        return;
    }

    const newProduct = await productServices.addNewProduct(result.data);
    res.status(201).json(newProduct);
});

router.delete('/:id', async (req, res) => {
    const deletedProduct = await productServices.deleteProductById(
        req.params.id,
    );
    res.status(200).json(deletedProduct);
});

export default router;
