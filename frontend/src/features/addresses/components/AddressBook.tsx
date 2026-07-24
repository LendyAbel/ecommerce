import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { useState } from 'react';

import { useAddresses, useDeleteAddress } from '@/features/addresses/hooks/useAddresses';
import type { Address } from '@/features/addresses/schemas/addressSchemas';
import { ApiError } from '@/lib/api/client';
import { EmptyState, ErrorState } from '@/shared/components';
import { notify } from '@/shared/store/alertStore';
import { Button, Modal } from '@/shared/ui';

import AddressCard from './AddressCard';
import AddressForm from './AddressForm';
import AddressListSkeleton from './AddressListSkeleton';

/**
 * Libreta de direcciones del usuario: lista las direcciones y orquesta los
 * diálogos de crear, editar y eliminar. Centraliza el estado de los modales para
 * que las tarjetas se mantengan presentacionales.
 */
const AddressBook = () => {
    const { data: addresses, isLoading, isError, refetch } = useAddresses();
    const deleteAddress = useDeleteAddress();

    // Diálogo de formulario: `null` = cerrado, `'new'` = crear, Address = editar.
    const [formTarget, setFormTarget] = useState<Address | 'new' | null>(null);
    // Dirección pendiente de confirmar borrado.
    const [toDelete, setToDelete] = useState<Address | null>(null);

    const closeForm = () => {
        setFormTarget(null);
    };

    const handleConfirmDelete = async () => {
        if (!toDelete) return;
        try {
            await deleteAddress.mutateAsync(toDelete.id);
            setToDelete(null);
            notify.success('Dirección eliminada');
        } catch (error) {
            notify.error(
                error instanceof ApiError
                    ? error.message
                    : 'No se pudo eliminar la dirección. Inténtalo de nuevo.',
            );
        }
    };

    return (
        <>
            <div className='mb-6 flex justify-end'>
                <Button
                    leftIcon={<AddOutlinedIcon fontSize='small' />}
                    onClick={() => setFormTarget('new')}
                >
                    Añadir dirección
                </Button>
            </div>

            {isLoading ? (
                <AddressListSkeleton />
            ) : isError ? (
                <ErrorState
                    message='No pudimos cargar tus direcciones. Inténtalo de nuevo en unos instantes.'
                    action={
                        <Button variant='outline' onClick={() => refetch()}>
                            Reintentar
                        </Button>
                    }
                />
            ) : addresses && addresses.length > 0 ? (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    {addresses.map(address => (
                        <AddressCard
                            key={address.id}
                            address={address}
                            onEdit={setFormTarget}
                            onDelete={setToDelete}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={<PlaceOutlinedIcon fontSize='large' />}
                    title='Aún no tienes direcciones'
                    message='Añade una dirección para agilizar tus próximas compras.'
                    action={
                        <Button
                            className='mt-1'
                            leftIcon={<AddOutlinedIcon fontSize='small' />}
                            onClick={() => setFormTarget('new')}
                        >
                            Añadir dirección
                        </Button>
                    }
                />
            )}

            {/* Crear / editar */}
            <Modal
                open={formTarget !== null}
                onClose={closeForm}
                eyebrow='Mi cuenta'
                title={
                    formTarget && formTarget !== 'new'
                        ? 'Editar dirección'
                        : 'Nueva dirección'
                }
            >
                {formTarget !== null && (
                    <AddressForm
                        address={formTarget === 'new' ? undefined : formTarget}
                        onSuccess={closeForm}
                        onCancel={closeForm}
                    />
                )}
            </Modal>

            {/* Confirmar borrado */}
            <Modal
                open={toDelete !== null}
                onClose={() => setToDelete(null)}
                title='Eliminar dirección'
            >
                <div className='px-6 pt-2 pb-6'>
                    <p className='text-text-60 text-sm'>
                        ¿Seguro que quieres eliminar esta dirección? Esta acción
                        no se puede deshacer.
                    </p>
                    {toDelete && (
                        <p className='text-text mt-3 text-sm font-medium'>
                            {toDelete.fullName} — {toDelete.line1},{' '}
                            {toDelete.postalCode} {toDelete.city}
                        </p>
                    )}
                    <div className='mt-6 flex justify-end gap-3'>
                        <Button
                            variant='outline'
                            onClick={() => setToDelete(null)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant='danger'
                            loading={deleteAddress.isPending}
                            onClick={handleConfirmDelete}
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AddressBook;
