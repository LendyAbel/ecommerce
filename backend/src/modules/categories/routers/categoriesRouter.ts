import express from 'express';
import categoriesServices from '../services/categoriesServices';
import { normalizeName } from '../../../lib/utils';

const router = express.Router();

router.get('/', async (_req, res) => {
    const categories = await categoriesServices.getAllCategories();
    res.status(200).json(categories);
});

router.delete('/:name', async (req, res) => {
    const name = normalizeName(decodeURIComponent(req.params.name));
    if (!name || name.trim() === '') {
        res.status(400).json({ error: 'category name is required' });
        return;
    }

    const deletedCategory = await categoriesServices.deleteCategoryByName(name);
    res.status(200).json(deletedCategory);
});

export default router;
