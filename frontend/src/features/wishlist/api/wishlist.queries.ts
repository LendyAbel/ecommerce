import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';

import wishlistService from './wishlist.service';

const wishlistKeys = {
    wishlist: ['wishlist'] as const,
    add: () => [...wishlistKeys.wishlist, 'add'],
    remove: () => [...wishlistKeys.wishlist, 'remove'],
};

export const fetchWishlistQueryOptions = (enabled: boolean) =>
    queryOptions({
        queryKey: wishlistKeys.wishlist,
        queryFn: wishlistService.getWishlist,
        enabled,
    });

export const addToWishlistMutationOptions = () =>
    mutationOptions({
        mutationKey: wishlistKeys.add(),
        mutationFn: async (productId: string) =>
            await wishlistService.addItem(productId),
        // El backend devuelve la wishlist ya actualizada: se escribe directo en la
        // caché para reflejar el cambio al instante, sin esperar un refetch aparte.
        onSuccess: data => {
            queryClient.setQueryData(wishlistKeys.wishlist, data);
        },
    });

export const removeFromWishlistMutationOptions = () =>
    mutationOptions({
        mutationKey: wishlistKeys.remove(),
        mutationFn: async (productId: string) =>
            await wishlistService.removeItem(productId),
        onSuccess: data => {
            queryClient.setQueryData(wishlistKeys.wishlist, data);
        },
    });
