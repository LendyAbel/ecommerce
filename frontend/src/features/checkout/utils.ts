export const getOrCreateIdempotencyKey = (orderId: string): string => {
    const storegeKey = `idempotency_key_${orderId}`;
    let key = sessionStorage.getItem(storegeKey);

    if (!key) {
        key = crypto.randomUUID();
        sessionStorage.setItem(storegeKey, key);
    }
    return key;
};
