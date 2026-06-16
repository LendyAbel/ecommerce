import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '../../store/cartStore';
import cartService from '../../services/cart.service';
import { logger } from '@/lib/logger';

export const useSyncCart = () => {
    const { cart } = useCartStore();
    const setCartItems = useCartStore(state => state.setCartItems);

    const syncMutation = useMutation({
        mutationKey: ['cart', 'sync'],
        mutationFn: async () => {
            // Items en paralelo: cada producto es una fila distinta y el backend
            // hace upsert atómico por (cartId, productId), así que no hay carrera.
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

    // Used on logout: clears backend cart first, then re-adds all local items (replace, not accumulate)
    const replaceMutation = useMutation({
        mutationKey: ['cart', 'replace'],
        mutationFn: async () => {
            // clearCart primero (dependencia), luego los items en paralelo.
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
