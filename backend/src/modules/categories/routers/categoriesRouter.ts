import express from 'express';

import { authenticate, requireAdmin } from '../../../middlewares/authMiddleware';
import * as categoriesController from '../controllers/categoriesController';

const router = express.Router();

router.get('/', categoriesController.getAllCategories);
router.delete(
    '/:name',
    authenticate,
    requireAdmin,
    categoriesController.deleteCategory,
);

export default router;
