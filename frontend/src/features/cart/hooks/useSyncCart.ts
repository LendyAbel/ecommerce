import { useMutation } from '@tanstack/react-query';

import cartService from '@/features/cart/api/cart.service';
import { useCartStore } from '@/features/cart/store/cartStore';
import { logger } from '@/lib/logger';


const CART_KEY = 'cart';

export const useSyncCart = () => {
    const { cart } = useCartStore();
    const setCartItems = useCartStore(state => state.setCartItems);

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
            setCartItems(data.cartItems);
        },
    });

    const syncLoggoutCartMutation = useMutation({
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
            setCartItems(data.cartItems);
        },
        onError: error => {
            logger.error('Cart sync failed:', error);
        },
    });

    const fetchMutation = useMutation({
        mutationKey: [...CART_KEY, 'fetch'],
        mutationFn: () => cartService.getCart(),
        onSuccess: data => {
            logger.debug('fetchmutation:', data);
            setCartItems(data.cartItems);
        },
        onError: error => {
            logger.error('Cart fetch failed:', error);
        },
    });

    return {
        addItemToBackend: addMutation.mutateAsync,
        syncWithBackendAsync: syncLoggoutCartMutation.mutateAsync,
        isSyncing: syncLoggoutCartMutation.isPending,
        syncError: syncLoggoutCartMutation.error,
        fetchFromBackendAsync: fetchMutation.mutateAsync,
        isFetchingCart: fetchMutation.isPending,
        
    };
};
