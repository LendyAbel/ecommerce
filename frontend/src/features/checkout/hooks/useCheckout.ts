import { useMutation, useQueryClient } from '@tanstack/react-query';

import checkoutService from '@/features/checkout/api/checkout.service';
import { orderKeys } from '@/features/orders/api/orders.queries';

export const useCreateCheckout = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            orderId,
            idempotencyKey,
        }: {
            orderId: string;
            idempotencyKey: string;
        }) => checkoutService.createCheckoutSession(orderId, idempotencyKey),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
};
