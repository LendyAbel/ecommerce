import { useMutation, useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/authStore';
import {
    addToWishlistMutationOptions,
    fetchWishlistQueryOptions,
    removeFromWishlistMutationOptions,
} from '@/features/wishlist/api/wishlist.queries';

export const useWishlist = () => {
    const user = useAuthStore(state => state.user);
    return useQuery(fetchWishlistQueryOptions(!!user));
};

export const useAddWishItem = () => {
    return useMutation(addToWishlistMutationOptions());
};

export const useRemoveWishItem = () => {
    return useMutation(removeFromWishlistMutationOptions());
};
