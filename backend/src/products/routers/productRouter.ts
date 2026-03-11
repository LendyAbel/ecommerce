import express from 'express';
import productServices from '../services/productServices';

const router = express.Router();

router.get('/', async (_req, res) => {
    try {
        const products = await productServices.getAllProducts();
        res.send(products);
    } catch (error) {
        console.log('Error: ', error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await productServices.getProductById(req.params.id);
        res.send(product);
    } catch (error) {
        console.log('Error: ', error);
    }
});

router.post('/', async (req, res) => {
    try {
        const newProduct = await productServices.addNewProduct(req.body);
        res.send(newProduct);
    } catch (error) {
        console.log('Error: ', error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await productServices.deleteProductById(
            req.params.id,
        );
        res.send(deletedProduct);
    } catch (error) {
        console.log('Error: ', error);
    }
});

export default router;
