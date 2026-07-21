import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';

import {
    addToCartMutationOptions,
    clearCartMutationOptions,
    fetchCartMutationOptions,
    removeCartItemMutationOptions,
    syncCartMutationOptions,
    updateCartMutationOptions,
} from '@/features/cart/api/cart.queries';
import type { CartItem, LocalCartItem } from '@/features/cart/types/cartTypes';
import { logger } from '@/lib/logger';

export const mapBackendCartItemsToLocalCartItems = (
    items: CartItem[],
): LocalCartItem[] =>
    items.map(({ product, quantity }) => ({ product, quantity }));

export const useSyncCart = () => {
    const fetchMutation = useMutation(fetchCartMutationOptions());

    const addMutation = useMutation(addToCartMutationOptions());

    const updateRequestIdRef = useRef(0);

    const updateMutation = useMutation({
        ...updateCartMutationOptions(),
        onMutate: () => ({ requestId: ++updateRequestIdRef.current }),
        onSuccess: (data, _vars, onMutateResult) => {
            if (onMutateResult.requestId !== updateRequestIdRef.current) {
                logger.debug('Discarding stale cart-update response');
                return;
            }
            logger.debug('updateMutation:', data);
        },
    });

    const removeMutation = useMutation(removeCartItemMutationOptions());

    const clearMutation = useMutation(clearCartMutationOptions());

    const syncCartMutation = useMutation(syncCartMutationOptions());

    return {
        addItemToBackend: addMutation.mutateAsync,
        updateItemInBackend: updateMutation.mutateAsync,
        removeItemInBackend: removeMutation.mutateAsync,
        clearCartInBackend: clearMutation.mutateAsync,
        syncWithBackendAsync: syncCartMutation.mutateAsync,
        isSyncing: syncCartMutation.isPending,
        syncError: syncCartMutation.error,
        fetchFromBackendAsync: fetchMutation.mutateAsync,
        isFetchingCart: fetchMutation.isPending,
    };
};
