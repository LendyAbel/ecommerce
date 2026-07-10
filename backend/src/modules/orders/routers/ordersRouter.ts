import express from 'express';

import {
    authenticate,
    requireAdmin,
} from '../../../middlewares/authMiddleware';
import * as paymentController from '../../payments/controllers/paymentController';
import * as orderController from '../controllers/ordersController';

const router = express.Router();
router.use(authenticate);

router.get('/', orderController.listOrders);
router.post('/', orderController.createOrder);

router.get('/all', requireAdmin, orderController.listAllOrders);

router.get('/:orderId', orderController.getOrder);

router.patch(
    '/:orderId/status',
    requireAdmin,
    orderController.updateStatusOrder,
);
router.patch('/:orderId/cancel', orderController.cancelOrder);

router.post(
    '/:orderId/checkout-session',
    paymentController.createCheckoutSession,
);

export default router;
