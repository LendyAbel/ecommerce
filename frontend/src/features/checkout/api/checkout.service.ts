import { apiClient } from '@/lib/api/client';

const createCheckoutSession = async (
    orderId: string,
    idempotencyKey: string,
) => {
    const res = await apiClient.post<{ id: string; url: string }>(
        `/orders/${orderId}/checkout-session`,
        {},
        {
            headers: { 'Idempotency-Key': idempotencyKey },
        },
    );

    return res.data;
};

export default { createCheckoutSession };
