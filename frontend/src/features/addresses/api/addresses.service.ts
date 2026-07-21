import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/validateResponse';

import {
    type Address,
    type AddressFormInput,
    AddressSchema,
} from '../schemas/addressSchemas';

const getMyAddresses = async (): Promise<Address[]> => {
    const res = await apiClient.get('/addresses');
    return validateResponse(AddressSchema.array(), res.data, 'GET /addresses');
};

const createAddress = async (data: AddressFormInput): Promise<Address> => {
    const res = await apiClient.post('/addresses', data);
    return validateResponse(AddressSchema, res.data, 'POST /addresses');
};

const updateAddress = async (
    id: string,
    data: Partial<AddressFormInput>,
): Promise<Address> => {
    const res = await apiClient.patch(`/addresses/${id}`, data);
    return validateResponse(AddressSchema, res.data, `PATCH /addresses/${id}`);
};

const deleteAddress = async (id: string): Promise<void> => {
    await apiClient.delete(`/addresses/${id}`);
};

export default { getMyAddresses, createAddress, updateAddress, deleteAddress };
