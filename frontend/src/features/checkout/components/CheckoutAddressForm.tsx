import { useForm } from '@tanstack/react-form';
import { useState } from 'react';

import { type AddressFormInput, AddressFormSchema } from '@/features/addresses';
import { Button } from '@/shared/ui';
import TextFieldInput from '@/shared/ui/TextFieldInput';

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

// `full` ocupa toda la fila; el resto se reparte en dos columnas en sm+.
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

type CheckoutAddressFormProps = {
    /** Valores iniciales (al volver a editar una dirección ya escrita). */
    initial?: AddressFormInput;
    /** Estado inicial del check «guardar en mi libreta». */
    initialSave?: boolean;
    /**
     * Se ejecuta al validar y aceptar la dirección. NO llama a la API: solo
     * entrega los datos al wizard, que decidirá si guardarla o usarla suelta.
     */
    onCommit: (values: AddressFormInput, save: boolean) => void;
    /** Se ejecuta al pulsar «Cancelar». */
    onCancel: () => void;
};

/**
 * Formulario para escribir una dirección durante el checkout. A diferencia de
 * `AddressForm` (libreta), aquí el submit no persiste nada: devuelve los datos
 * por `onCommit` para usarlos solo en esta orden, con la opción de guardarlos.
 */
const CheckoutAddressForm = ({
    initial,
    initialSave = false,
    onCommit,
    onCancel,
}: CheckoutAddressFormProps) => {
    const [save, setSave] = useState(initialSave);

    const { Field, handleSubmit } = useForm({
        defaultValues: initial ?? emptyValues,
        validators: { onSubmit: AddressFormSchema, onBlur: AddressFormSchema },
        onSubmit: ({ value }) => onCommit(value, save),
    });

    const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSubmit();
    };

    return (
        <form
            onSubmit={onSubmit}
            className='border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5'
        >
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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

            <label className='text-text-60 flex cursor-pointer items-center gap-2 text-sm'>
                <input
                    type='checkbox'
                    className='accent-primary size-4'
                    checked={save}
                    onChange={e => setSave(e.target.checked)}
                />
                Guardar esta dirección en mi libreta
            </label>

            <div className='flex justify-end gap-3'>
                <Button type='button' variant='outline' onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type='submit'>Usar esta dirección</Button>
            </div>
        </form>
    );
};

export default CheckoutAddressForm;
