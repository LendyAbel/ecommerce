import { useMutation, useQuery } from '@tanstack/react-query';

import {
    createAddressMutationOptions,
    deleteAddressMutationOptions,
    getAddressesQueryOptions,
    updateAddressMutationOptions,
} from '@/features/addresses/api/adresses.queries';
import { useAuthStore } from '@/features/auth/store/authStore';

export const useAddresses = () => {
    const { user } = useAuthStore();
    return useQuery(getAddressesQueryOptions(!!user));
};

export const useCreateAddress = () => {
    return useMutation(createAddressMutationOptions());
};

export const useUpdateAddress = () => {
    return useMutation(updateAddressMutationOptions());
};

export const useDeleteAddress = () => {
    return useMutation(deleteAddressMutationOptions());
};
