import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import {
    mapBackendCartItemsToLocalCartItems,
    useCartStore,
    useSyncCart,
} from '@/features/cart';
import { logger } from '@/lib/logger';
import { queryClient } from '@/lib/queryClient';

import {
    loginMutationOptions,
    logoutMutationOptions,
    meQueryOptions,
    registerMutationOptions,
} from '../api/auth.queries';
import { useAuthStore } from '../store/authStore';

export const useAuthBootsTrap = () => {
    const { fetchFromBackendAsync } = useSyncCart();
    const query = useQuery(meQueryOptions());

    // React Query v5 no tiene onSuccess/onSettled en useQuery, y hacer esto
    // dentro del queryFn lo repetiría en cada refetch/retry silencioso.
    // Reaccionamos a los cambios de `data` en su lugar.
    useEffect(() => {
        if (query.isPending) return;

        useAuthStore.getState().setUser(query.data ?? null);

        if (query.data) {
            // No se espera (fire-and-forget): el bootstrap de auth no debe
            // bloquearse ni fallar por un error al traer el carrito.
            // useSyncCart ya loguea el error.
            fetchFromBackendAsync()
                .then(cart => {
                    useCartStore
                        .getState()
                        .setCartItems(
                            mapBackendCartItemsToLocalCartItems(cart.cartItems),
                        );
                })
                .catch(() => {
                    /* empty */
                });
        }

        useAuthStore.getState().setAuthLoading(false);
    }, [query.data, query.isPending, fetchFromBackendAsync]);

    return query;
};

export const useAuth = () => {
    const { syncWithBackendAsync } = useSyncCart();

    const syncCartOnAuth = async () => {
        const localCartItems = useCartStore.getState().cart.cartItems;
        const cart = await syncWithBackendAsync(localCartItems);
        useCartStore
            .getState()
            .setCartItems(mapBackendCartItemsToLocalCartItems(cart.cartItems));
    };

    const loginMutation = useMutation({
        ...loginMutationOptions(),
        onSuccess: async user => {
            useAuthStore.getState().setUser(user);
            await syncCartOnAuth();
            logger.debug('Sync Cart on LOGIN');
        },
    });

    const registerMutation = useMutation({
        ...registerMutationOptions(),
        onSuccess: async user => {
            useAuthStore.getState().setUser(user);
            await syncCartOnAuth();
            logger.debug('Sync Cart on REGISTER');
        },
    });

    const logoutMutation = useMutation({
        ...logoutMutationOptions(),
        onSuccess: () => {
            useAuthStore.getState().setUser(null);
            useCartStore.getState().clearCart();
            queryClient.clear();
            logger.debug('Sync Cart on LOGOUT');
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
