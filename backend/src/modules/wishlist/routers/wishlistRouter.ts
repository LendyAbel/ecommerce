import express from 'express';

import { authenticate } from '../../../middlewares/authMiddleware';
import * as wishlistController from '../controllers/wishlistController';

const router = express.Router();
router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.get('/items/:productId', wishlistController.checkItem);
router.post('/items', wishlistController.addItem);
router.delete('/items/:productId', wishlistController.removeItem);

export default router;
