import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    mapBackendCartItemsToLocalCartItems,
    useCartStore,
    useSyncCart,
} from '@/features/cart';
import { logger } from '@/lib/logger';

import authService from '../api/auth.service';
import { useAuthStore } from '../store/authStore';

export const useAuthBootsTrap = () => {
    const setUser = useAuthStore(state => state.setUser);
    const setAuthLoading = useAuthStore(state => state.setAuthLoading);
    const { fetchFromBackendAsync } = useSyncCart();

    // No se espera (fire-and-forget): el bootstrap de auth no debe bloquearse
    // ni fallar por un error al traer el carrito. useSyncCart ya loguea el error.
    const hydrateCartFromBackend = async () => {
        try {
            const cart = await fetchFromBackendAsync();
            useCartStore
                .getState()
                .setCartItems(mapBackendCartItemsToLocalCartItems(cart.cartItems));
        } catch {
            /* empty */
        }
    };

    const meQuery = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            setAuthLoading(true);
            try {
                const data = await authService.me();
                setUser(data);
                hydrateCartFromBackend();
                return data;
            } catch (error) {
                setUser(null);
                logger.debug(error);
                return null;
            } finally {
                setAuthLoading(false);
            }
        },
        retry: false,
    });
    return { meQuery };
};

export const useAuth = () => {
    const queryClient = useQueryClient();

    const setUser = useAuthStore(state => state.setUser);
    const { syncWithBackendAsync } = useSyncCart();

    const syncCartOnAuth = async () => {
        const localCartItems = useCartStore.getState().cart.cartItems;
        const cart = await syncWithBackendAsync(localCartItems);
        useCartStore
            .getState()
            .setCartItems(mapBackendCartItemsToLocalCartItems(cart.cartItems));
    };

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: async user => {
            setUser(user);
            await syncCartOnAuth();
            logger.debug('Sync Cart on LOGIN');
        },
    });

    const registerMutation = useMutation({
        mutationFn: authService.register,
        onSuccess: async user => {
            setUser(user);
            await syncCartOnAuth();
            logger.debug('Sync Cart on REGISTER');
        },
    });

    const logoutMutation = useMutation({
        mutationKey: ['logout'],
        mutationFn: async () => {
            logger.debug('Sync Cart on LOGOUT');
            await authService.logout();
        },
        onSuccess: () => {
            setUser(null);
            useCartStore.getState().clearCart();
            queryClient.clear();
        },
    });

    return {
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        isLoginPending: loginMutation.isPending,
        isRegisterPending: registerMutation.isPending,
        isLogoutPending: logoutMutation.isPending,
    };
};
