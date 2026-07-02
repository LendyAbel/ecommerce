import { apiClient } from '@/lib/api/client';

import type { Address, AddressFormInput } from '../schemas/addressSchemas';

const getMyAddresses = async (): Promise<Address[]> => {
    const res = await apiClient.get('/addresses');
    return res.data.addresses;
};

const createAddress = async (data: AddressFormInput): Promise<Address> => {
    const res = await apiClient.post('/addresses', data);
    return res.data;
};

const updateAddress = async (
    id: string,
    data: Partial<AddressFormInput>,
): Promise<Address> => {
    const res = await apiClient.patch(`/addresses/${id}`, data);
    return res.data;
};

const deleteAddress = async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
};

export default { getMyAddresses, createAddress, updateAddress, deleteAddress };
