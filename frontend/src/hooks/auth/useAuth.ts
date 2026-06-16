import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/auth.service';
import { useSyncCart } from '../cart/useSyncCart';
import { useCartStore } from '../../store/cartStore';
import { logger } from '@/lib/logger';

export const useAuth = () => {
    const queryClient = useQueryClient();
    const setUser = useAuthStore(state => state.setUser);
    const setAuthLoading = useAuthStore(state => state.setAuthLoading);
    const { syncWithBackendAsync, fetchFromBackendAsync, replaceCartAsync } = useSyncCart();
    const meQuery = useQuery({
        queryKey: ['user'],
        queryFn: authService.me,
        retry: false,
    });

    useEffect(() => {
        setAuthLoading(meQuery.isLoading);
    }, [meQuery.isLoading, setAuthLoading]);

    useEffect(() => {
        if (meQuery.isSuccess) {
            setUser(meQuery.data);
            fetchFromBackendAsync();
            logger.debug('Fetch Cart on ME');
        }
        if (meQuery.isError) {
            setUser(null);
        }
    }, [meQuery.isSuccess, meQuery.isError, meQuery.data, setUser, fetchFromBackendAsync]);

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
        mutationFn: async () => {
            await replaceCartAsync();
            logger.debug('Sync Cart on LOGOUT');
            await authService.logout();
        },
        onSuccess: () => {
            setUser(null);
            useCartStore.getState().clearCart();
            queryClient.resetQueries({ queryKey: ['user'] });
        },
    });

    return {
        isAuthLoading: meQuery.isLoading,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        isLoginPending: loginMutation.isPending,
        isRegisterPending: registerMutation.isPending,
    };
};
