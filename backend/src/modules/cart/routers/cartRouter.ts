import express from 'express';

import { authenticate } from '../../../middlewares/authMiddleware';
import * as cartController from '../controllers/cartController';

const router = express.Router();
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.patch('/items/:productId', cartController.updateItem);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
