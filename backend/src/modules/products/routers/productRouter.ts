import express from 'express';
import productServices from '../services/productServices';
import { ProductCreateSchema } from '../schemas/productsZodSchema';

const router = express.Router();

router.get('/', async (_req, res) => {
    try {
        const products = await productServices.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await productServices.getProductById(req.params.id);
        res.status(200).json(product);
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/', async (req, res) => {
    try {
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
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await productServices.deleteProductById(
            req.params.id,
        );
        res.status(200).json(deletedProduct);
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
