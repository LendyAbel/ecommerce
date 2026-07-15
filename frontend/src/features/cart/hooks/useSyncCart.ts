import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';

import { logger } from '@/lib/logger';

import cartService from '../api/cart.service';
import type { CartItem, LocalCartItem } from '../types/cartTypes';

const CART_KEY = 'cart';

export const mapBackendCartItemsToLocalCartItems = (
    items: CartItem[],
): LocalCartItem[] =>
    items.map(({ product, quantity }) => ({ product, quantity }));

export const useSyncCart = () => {
    const fetchMutation = useMutation({
        mutationKey: [...CART_KEY, 'fetch'],
        mutationFn: () => cartService.getCart(),
        onError: error => {
            logger.error('Cart fetch failed:', error);
        },
    });

    const addMutation = useMutation({
        mutationKey: [...CART_KEY, 'add'],
        mutationFn: async ({
            productId,
            quantity = 1,
        }: {
            productId: string;
            quantity?: number;
        }) => {
            return await cartService.addItem(productId, quantity);
        },
        onSuccess: data => {
            logger.debug('addMutation:', data);
        },
    });

    const updateRequestIdRef = useRef(0);

    const updateMutation = useMutation({
        mutationKey: [...CART_KEY, 'update'],
        mutationFn: async ({
            productId,
            quantity = 1,
        }: {
            productId: string;
            quantity: number;
        }) => await cartService.updateItem(productId, quantity),
        onMutate: () => ({ requestId: ++updateRequestIdRef.current }),
        onSuccess: (data, _vars, onMutateResult) => {
            if (onMutateResult.requestId !== updateRequestIdRef.current) {
                logger.debug('Discarding stale cart-update response');
                return;
            }
            logger.debug('addMutation:', data);
        },
    });

    const removeMutation = useMutation({
        mutationKey: [...CART_KEY, 'remove'],
        mutationFn: async (productId: string) => {
            return await cartService.removeItem(productId);
        },
        onSuccess: data => {
            logger.debug('addMutation:', data);
        },
    });

    const clearMutation = useMutation({
        mutationKey: [...CART_KEY, 'clear'],
        mutationFn: () => cartService.clearCart(),
        onSuccess: () => {
            logger.debug('clearMutation:');
        },
        onError: error => {
            logger.error('Cart fetch failed:', error);
        },
    });

    const syncCartMutation = useMutation({
        mutationKey: [...CART_KEY, 'sync'],
        mutationFn: async (localCartItems: LocalCartItem[]) => {
            await Promise.all(
                localCartItems.map(item =>
                    cartService.addItem(item.product.id, item.quantity),
                ),
            );
            return cartService.getCart();
        },
        onError: error => {
            logger.error('Cart sync failed:', error);
        },
    });

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
