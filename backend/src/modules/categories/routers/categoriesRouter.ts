import express from 'express';
import categoriesServices from '../services/categoriesServices';
import { normalizeName } from '../../../lib/utils';

const router = express.Router();

router.get('/', async (_req, res) => {
    try {
        const categories = await categoriesServices.getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:name', async (req, res) => {
    try {
        const name = normalizeName(decodeURIComponent(req.params.name));
        if (!name || name.trim() === '') {
            res.status(400).json({ error: 'category name is required' });
            return;
        }

        const deletedCategory =
            await categoriesServices.deleteCategoryByName(name);
        res.status(200).json(deletedCategory);
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
