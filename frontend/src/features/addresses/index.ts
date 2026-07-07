export { default as AddressBook } from './components/AddressBook';
export {
    useCreateAddress,
    useDeleteAddress,
    useGetAddresses,
    useUpdateAddress,
} from './hooks/useAddresses';
export type { Address, AddressFormInput } from './schemas/addressSchemas';
export { AddressFormSchema } from './schemas/addressSchemas';
