import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '../../store/cartStore';
import cartService from '../../services/cart.service';

export const useSyncCart = () => {
    // const queryClient = useQueryClient();
    const { cart } = useCartStore();
    const setCartItems = useCartStore(state => state.setCartItems);

    const syncMutation = useMutation({
        mutationKey: ['cart', 'sync'],
        mutationFn: async () => {
            if (cart.cartItems.length === 0) {
                return cartService.getCart();
            }
            for (const item of cart.cartItems) {
                await cartService.addItem(item.product.id, item.quantity);
            }
            return cartService.getCart();
        },
        onSuccess: data => {
            console.log('syncmutation:', data);
            setCartItems(data.cartItems);
        },
        onError: error => {
            console.error('Cart sync failed:', error);
        },
    });

    const fetchMutation = useMutation({
        mutationKey: ['cart', 'fetch'],
        mutationFn: () => cartService.getCart(),
        onSuccess: data => {
            console.log('fetchmutation:', data);
            setCartItems(data.cartItems);
        },
        onError: error => {
            console.error('Cart fetch failed:', error);
        },
    });

    // Used on logout: clears backend cart first, then re-adds all local items (replace, not accumulate)
    const replaceMutation = useMutation({
        mutationKey: ['cart', 'replace'],
        mutationFn: async () => {
            await cartService.clearCart();
            for (const item of cart.cartItems) {
                await cartService.addItem(item.product.id, item.quantity);
            }
            return cartService.getCart();
        },
        onSuccess: data => {
            console.log('replacemutation:', data);
            setCartItems(data.cartItems);
        },
        onError: error => {
            console.error('Cart replace failed:', error);
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
