import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import authService from '@/features/auth/api/auth.service';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useSyncCart } from '@/features/cart/hooks/useSyncCart';
import { useCartStore } from '@/features/cart/store/cartStore';
import { logger } from '@/lib/logger';

export const useAuthBootsTrap = () => {
    const setUser = useAuthStore(state => state.setUser);
    const setAuthLoading = useAuthStore(state => state.setAuthLoading);
    const { fetchFromBackendAsync } = useSyncCart();

    const meQuery = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            setAuthLoading(true);
            try {
                const data = await authService.me();
                setUser(data);
                fetchFromBackendAsync();
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

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: async user => {
            setUser(user);
            await syncWithBackendAsync();
            logger.debug('Sync Cart on LOGIN');
        },
    });

    const registerMutation = useMutation({
        mutationFn: authService.register,
        onSuccess: async user => {
            setUser(user);
            await syncWithBackendAsync();
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
