import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '@/features/cart/store/cartStore';
import cartService from '@/features/cart/api/cart.service';
import { logger } from '@/lib/logger';
import { notify } from '@/shared/store/alertStore';

export const useSyncCart = () => {
    const { cart } = useCartStore();
    const setCartItems = useCartStore(state => state.setCartItems);

    const syncMutation = useMutation({
        mutationKey: ['cart', 'sync'],
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
        mutationKey: ['cart', 'fetch'],
        mutationFn: () => cartService.getCart(),
        onSuccess: data => {
            logger.debug('fetchmutation:', data);
            setCartItems(data.cartItems);
        },
        onError: error => {
            logger.error('Cart fetch failed:', error);
        },
    });


    const replaceMutation = useMutation({
        mutationKey: ['cart', 'replace'],
        mutationFn: async () => {
            await cartService.clearCart();
            await Promise.all(
                cart.cartItems.map(item =>
                    cartService.addItem(item.product.id, item.quantity),
                ),
            );
            return cartService.getCart();
        },
        onSuccess: data => {
            logger.debug('replacemutation:', data);
            setCartItems(data.cartItems);
        },
        onError: error => {
            notify.error('Error saving cart')
            logger.error('Cart replace failed:', error);
        },
    });

    return {
        syncWithBackendAsync: syncMutation.mutateAsync,
        isSyncing: syncMutation.isPending,
        syncError: syncMutation.error,
        fetchFromBackendAsync: fetchMutation.mutateAsync,
        isFetchingCart: fetchMutation.isPending,
        replaceCartAsync: replaceMutation.mutateAsync,
    };
};
