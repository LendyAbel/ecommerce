import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ORDER_KEY } from '@/features/orders/hooks/useOrder';

import checkoutService from '../api/checkout.service';

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
            qc.invalidateQueries({ queryKey: ORDER_KEY });
        },
    });
};
