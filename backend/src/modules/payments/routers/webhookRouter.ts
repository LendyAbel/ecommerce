import express from 'express';

import * as webhookController from '../controllers/webhookController';

const router = express.Router();
router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    webhookController.handleStripeWebhook,
);

export default router;
