import express from 'express';
import {
    addNewProduct,
    deleteProductById,
    getAllProducts,
    getProductById,
} from '../services/productServices';

const router = express.Router();

router.get('/', async (_req, res) => {
    try {
        const products = await getAllProducts();
        res.send(products);
    } catch (error) {
        console.log('Error: ', error);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await getProductById(req.params.id);
        res.send(product);
    } catch (error) {
        console.log('Error: ', error);
    }
});

router.post('/', async (req, res) => {
    try {
        const newProduct = await addNewProduct(req.body);
        res.send(newProduct);
    } catch (error) {
        console.log('Error: ', error);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedProduct = await deleteProductById(req.params.id);
        res.send(deletedProduct);
    } catch (error) {
        console.log('Error: ', error);
    }
});

export default router;
