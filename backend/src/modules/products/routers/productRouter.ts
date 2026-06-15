import express from 'express';
import {
    authenticate,
    requireAdmin,
} from '../../../middlewares/authMiddleware';
import * as productController from '../controllers/productController';

const router = express.Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticate, requireAdmin, productController.createProduct);
router.patch('/:id', authenticate, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

export default router;
