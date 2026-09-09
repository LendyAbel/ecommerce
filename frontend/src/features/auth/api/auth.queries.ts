import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { logger } from '@/lib/logger';

import authService from './auth.service';

const authKeys = {
    user: ['user'] as const,
    login: () => [...authKeys.user, 'login'] as const,
    register: () => [...authKeys.user, 'register'] as const,
    logout: () => [...authKeys.user, 'logout'] as const,
    updateProfile: () => [...authKeys.user, 'update-profile'] as const,
    changePassword: () => [...authKeys.user, 'change-password'] as const,
    deleteAccount: () => [...authKeys.user, 'delete-account'] as const,
};

// Solo hace fetch y cachea; sin side-effects sobre stores aquí (ver useAuthBootsTrap).
export const meQueryOptions = () =>
    queryOptions({
        queryKey: authKeys.user,
        queryFn: async () => {
            try {
                return await authService.me();
            } catch (error) {
                logger.debug(error);
                return null;
            }
        },
        retry: false,
    });

export const loginMutationOptions = () =>
    mutationOptions({
        mutationKey: authKeys.login(),
        mutationFn: authService.login,
    });

export const registerMutationOptions = () =>
    mutationOptions({
        mutationKey: authKeys.register(),
        mutationFn: authService.register,
    });

export const logoutMutationOptions = () =>
    mutationOptions({
        mutationKey: authKeys.logout(),
        mutationFn: () => authService.logout(),
    });

export const updateProfileMutationOptions = () =>
    mutationOptions({
        mutationKey: authKeys.updateProfile(),
        mutationFn: authService.updateProfile,
    });

export const changePasswordMutationOptions = () =>
    mutationOptions({
        mutationKey: authKeys.changePassword(),
        mutationFn: authService.changePassword,
    });

export const deleteAccountMutationOptions = () =>
    mutationOptions({
        mutationKey: authKeys.deleteAccount(),
        mutationFn: () => authService.deleteAccount(),
    });
