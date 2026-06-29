import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import TextFieldInput from '@/shared/ui/TextFieldInput';
import { Button } from '@/shared/ui';
import { ApiError } from '@/lib/api/client';
import { useCreateAddress, useUpdateAddress } from '../hooks/useAddresses';
import {
    AddressFormSchema,
    type Address,
    type AddressFormInput,
} from '../schemas/addressSchemas';

const emptyValues: AddressFormInput = {
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
};

// Convierte una dirección existente en valores de formulario (null → '').
const toFormValues = (address: Address): AddressFormInput => ({
    fullName: address.fullName,
    phone: address.phone ?? '',
    line1: address.line1,
    line2: address.line2 ?? '',
    city: address.city,
    state: address.state ?? '',
    postalCode: address.postalCode,
    country: address.country,
});

// `full` ocupa toda la fila; el resto se reparte en dos columnas en pantallas sm+.
const fields: {
    name: keyof AddressFormInput;
    label: string;
    full?: boolean;
}[] = [
    { name: 'fullName', label: 'Nombre completo', full: true },
    { name: 'line1', label: 'Dirección', full: true },
    { name: 'line2', label: 'Dirección (línea 2)', full: true },
    { name: 'postalCode', label: 'Código postal' },
    { name: 'city', label: 'Ciudad' },
    { name: 'state', label: 'Estado / Provincia' },
    { name: 'country', label: 'País' },
    { name: 'phone', label: 'Teléfono', full: true },
];

type AddressFormProps = {
    /** Dirección a editar. Si se omite, el formulario crea una nueva. */
    address?: Address;
    /** Se ejecuta tras guardar con éxito (ej. cerrar el diálogo). */
    onSuccess?: () => void;
    /** Se ejecuta al pulsar «Cancelar». */
    onCancel?: () => void;
};

const AddressForm = ({ address, onSuccess, onCancel }: AddressFormProps) => {
    const createAddress = useCreateAddress();
    const updateAddress = useUpdateAddress();
    const [serverError, setServerError] = useState<string | null>(null);

    const { Field, handleSubmit, state } = useForm({
        defaultValues: address ? toFormValues(address) : emptyValues,
        validators: { onSubmit: AddressFormSchema, onBlur: AddressFormSchema },
        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                if (address) {
                    await updateAddress.mutateAsync({
                        id: address.id,
                        data: value,
                    });
                } else {
                    await createAddress.mutateAsync(value);
                }
                onSuccess?.();
            } catch (error) {
                setServerError(
                    error instanceof ApiError
                        ? error.message
                        : 'Error inesperado. Inténtalo de nuevo.',
                );
            }
        },
    });

    const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSubmit();
    };

    return (
        <form onSubmit={onSubmit} className='mt-6 mb-6 flex flex-col gap-2'>
            <div className='grid max-h-[60vh] grid-cols-1 gap-4 overflow-auto px-6 py-2 sm:grid-cols-2'>
                {fields.map((f, i) => (
                    <Field key={f.name} name={f.name}>
                        {field => (
                            <div className={f.full ? 'sm:col-span-2' : ''}>
                                <TextFieldInput
                                    field={field}
                                    label={f.label}
                                    autofocus={i === 0}
                                />
                            </div>
                        )}
                    </Field>
                ))}
            </div>

            {serverError && (
                <p className='text-error mt-1 px-6 text-xs font-medium'>
                    {serverError}
                </p>
            )}

            <div className='mt-2 flex justify-end gap-3 px-6'>
                <Button variant='outline' onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type='submit' loading={state.isSubmitting}>
                    {address ? 'Guardar cambios' : 'Añadir dirección'}
                </Button>
            </div>
        </form>
    );
};

export default AddressForm;
