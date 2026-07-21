import { useMutation, useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store/authStore';

import {
    createAddressMutationOptions,
    deleteAddressMutationOptions,
    getAddressesQueryOptions,
    updateAddressMutationOptions,
} from '../api/adresses.queries';

export const useGetAddresses = () => {
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
