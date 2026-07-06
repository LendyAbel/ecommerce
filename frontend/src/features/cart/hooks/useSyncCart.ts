import { useMutation } from '@tanstack/react-query';

import cartService from '@/features/cart/api/cart.service';
import { useCartStore } from '@/features/cart/store/cartStore';
import { logger } from '@/lib/logger';

const CART_KEY = 'cart';

export const useSyncCart = () => {
    const { cart } = useCartStore();
    const setStoreCartItems = useCartStore(state => state.setCartItems);
    const clearStoreCart = useCartStore(state => state.clearCart);

    const fetchMutation = useMutation({
        mutationKey: [...CART_KEY, 'fetch'],
        mutationFn: () => cartService.getCart(),
        onSuccess: data => {
            logger.debug('fetchmutation:', data);
            setStoreCartItems(data.cartItems);
        },
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
            setStoreCartItems(data.cartItems);
        },
    });

    const updateMutation = useMutation({
        mutationKey: [...CART_KEY, 'update'],
        mutationFn: async ({
            itemId,
            quantity = 1,
        }: {
            itemId: string;
            quantity: number;
        }) => {
            return await cartService.updateItem(itemId, quantity);
        },
        onSuccess: data => {
            logger.debug('addMutation:', data);
            setStoreCartItems(data.cartItems);
        },
    });

    const removeMutation = useMutation({
        mutationKey: [...CART_KEY, 'remove'],
        mutationFn: async (itemId: string) => {
            return await cartService.removeItem(itemId);
        },
    });

    const clearMutation = useMutation({
        mutationKey: [...CART_KEY, 'clear'],
        mutationFn: () => cartService.clearCart(),
        onSuccess: () => {
            logger.debug('clearMutation:');
            clearStoreCart();
        },
        onError: error => {
            logger.error('Cart fetch failed:', error);
        },
    });

    const syncCartMutation = useMutation({
        mutationKey: [...CART_KEY, 'sync'],
        mutationFn: async () => {
            await Promise.all(
                cart.cartItems.map(item =>
                    cartService.addItem(item.product.id, item.quantity),
                ),
            );
            return cartService.getCart();
        },
        onSuccess: data => {
            logger.debug('syncmutation:', data);
            setStoreCartItems(data.cartItems);
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
