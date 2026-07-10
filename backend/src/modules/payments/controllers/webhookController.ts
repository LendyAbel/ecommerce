import { Request, Response } from 'express';
import Stripe from 'stripe';

import { config } from '../../../lib/config';
import { stripe } from '../../../lib/stripe';
import paymentService from '../services/paymentService';

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body as Buffer,
            sig as string,
            config.STRIPE_WEBHOOK_SECRET,
        );
    } catch (err) {
        req.log?.warn({ err }, 'Stripe webhook signature verification failed');
        res.status(400).send(`Webhook Error: ${(err as Error).message}`);
        return;
    }

    if (
        event.type === 'checkout.session.completed' ||
        event.type === 'checkout.session.async_payment_succeeded'
    ) {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
            await paymentService.confirmOrderPayment({
                orderId,
                stripePaymentIntentId:
                    typeof session.payment_intent === 'string'
                        ? session.payment_intent
                        : session.payment_intent!.id,
                stripeCheckoutSessionId: session.id,
            });
        }
    }
    res.status(200).json({ received: true });
};
