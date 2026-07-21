import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { queryClient } from '@/lib/queryClient';

import type { AddressFormInput } from '../schemas/addressSchemas';
import addressesService from './addresses.service';

const addressesKeys = {
    all: ['addresses'] as const,
    create: () => [...addressesKeys.all, 'create'] as const,
    update: () => [...addressesKeys.all, 'update'] as const,
    delete: () => [...addressesKeys.all, 'delete'] as const,
};

export const getAddressesQueryOptions = (enabled: boolean) =>
    queryOptions({
        queryKey: addressesKeys.all,
        queryFn: addressesService.getMyAddresses,
        enabled,
    });

export const createAddressMutationOptions = () =>
    mutationOptions({
        mutationKey: addressesKeys.create(),
        mutationFn: (data: AddressFormInput) =>
            addressesService.createAddress(data),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: addressesKeys.all }),
    });

export const updateAddressMutationOptions = () =>
    mutationOptions({
        mutationKey: addressesKeys.update(),
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Partial<AddressFormInput>;
        }) => addressesService.updateAddress(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressesKeys.all });
        },
    });

export const deleteAddressMutationOptions = () =>
    mutationOptions({
        mutationKey: addressesKeys.delete(),
        mutationFn: (id: string) => addressesService.deleteAddress(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressesKeys.all });
        },
    });
