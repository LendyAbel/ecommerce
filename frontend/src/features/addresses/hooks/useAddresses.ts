import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth';

import addressesService from '../api/addresses.service';
import type { AddressFormInput } from '../schemas/addressSchemas';

const KEY = ['addresses'];

export const useGetAddresses = () => {
    const { user } = useAuthStore();
    return useQuery({
        queryKey: KEY,
        queryFn: addressesService.getMyAddresses,
        enabled: !!user,
    });
};

export const useCreateAddress = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: AddressFormInput) =>
            addressesService.createAddress(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};

export const useUpdateAddress = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Partial<AddressFormInput>;
        }) => addressesService.updateAddress(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};

export const useDeleteAddress = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => addressesService.deleteAddress(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: KEY });
        },
    });
};
