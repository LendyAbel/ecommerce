import { Request, Response } from 'express';

import { OrderIdParamSchema } from '../../orders/schemas/ordersSchemas';
import paymentService from '../services/paymentService';

export const createCheckoutSession = async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { orderId } = OrderIdParamSchema.parse(req.params);
    const idempotencyKey = req.header('Idempotency-Key');

    const session = await paymentService.createCheckoutSession(
        orderId,
        userId,
        idempotencyKey,
    );

    res.status(200).json(session);
};
