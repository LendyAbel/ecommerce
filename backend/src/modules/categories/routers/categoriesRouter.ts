import express from 'express';
import categoriesServices from '../services/categoriesServices';

const router = express.Router();

router.get('/', async (_req, res) => {
    try {
        const categories = await categoriesServices.getAllCategories();
        res.send(categories);
    } catch (error) {
        console.log('Error: ', error);
    }
});

export default router;
