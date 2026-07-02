import { useState } from 'react';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Button } from '@/shared/ui';
import type { Address } from '@/features/addresses/schemas/addressSchemas';
import type { CheckoutAddress } from '../types/checkoutTypes';
import { toDisplayAddress } from '../types/checkoutTypes';
import CheckoutAddressForm from './CheckoutAddressForm';

type AddressPickerProps = {
    addresses: Address[];
    value: CheckoutAddress | null;
    onChange: (value: CheckoutAddress) => void;
};

// Resumen compacto de una dirección (para tarjetas seleccionables).
const AddressLines = ({
    fullName,
    line1,
    line2,
    postalCode,
    city,
    state,
}: ReturnType<typeof toDisplayAddress>) => (
    <>
        <p className='text-text font-semibold'>{fullName}</p>
        <p className='text-text-60 text-sm'>
            {line1}
            {line2 && `, ${line2}`}
            <br />
            {postalCode} {city}
            {state && `, ${state}`}
        </p>
    </>
);

/**
 * Selector de dirección del checkout. Permite elegir una dirección guardada o
 * escribir una nueva (solo para esta orden, con opción de guardarla). Mantiene
 * el modo localmente y reporta la selección resuelta vía `onChange`.
 */
const AddressPicker = ({ addresses, value, onChange }: AddressPickerProps) => {
    // `true` mientras se escribe/edita una dirección nueva inline.
    const [editingNew, setEditingNew] = useState(false);

    const isNew = value?.kind === 'new';
    const selectedSavedId = value?.kind === 'saved' ? value.address.id : null;

    if (editingNew) {
        return (
            <CheckoutAddressForm
                initial={isNew ? value.values : undefined}
                initialSave={isNew ? value.save : false}
                onCommit={(values, save) => {
                    onChange({ kind: 'new', values, save });
                    setEditingNew(false);
                }}
                onCancel={() => setEditingNew(false)}
            />
        );
    }

    return (
        <div className='flex flex-col gap-3'>
            {addresses.map(address => {
                const selected = selectedSavedId === address.id;
                return (
                    <button
                        key={address.id}
                        type='button'
                        onClick={() => onChange({ kind: 'saved', address })}
                        className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors ${
                            selected
                                ? 'border-primary ring-primary-10 ring-2'
                                : 'border-border hover:border-primary'
                        }`}
                    >
                        <AddressLines {...toDisplayAddress({ kind: 'saved', address })} />
                    </button>
                );
            })}

            {/* Dirección nueva ya escrita: se muestra como opción seleccionada. */}
            {isNew && (
                <div className='border-primary ring-primary-10 flex flex-col gap-2 rounded-2xl border p-4 ring-2'>
                    <span className='text-text-38 text-xs font-semibold tracking-wide uppercase'>
                        Dirección nueva{value.save && ' · se guardará en tu libreta'}
                    </span>
                    <AddressLines {...toDisplayAddress(value)} />
                    <div>
                        <Button
                            size='sm'
                            variant='outline'
                            leftIcon={<EditOutlinedIcon fontSize='small' />}
                            onClick={() => setEditingNew(true)}
                        >
                            Editar
                        </Button>
                    </div>
                </div>
            )}

            {!isNew && (
                <Button
                    variant='outline'
                    leftIcon={<AddOutlinedIcon fontSize='small' />}
                    onClick={() => setEditingNew(true)}
                >
                    Escribir una dirección nueva
                </Button>
            )}
        </div>
    );
};

export default AddressPicker;
