import { useState } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ApiError } from '@/lib/api/client';
import { ConfirmDialog } from '@/shared/components';
import { notify } from '@/shared/store/alertStore';
import { Button, Card } from '@/shared/ui';

/**
 * Tarjeta con la acción destructiva de eliminar la cuenta. Vive en su propia
 * tarjeta dentro de la página "Mis datos", separada de las demás para
 * distinguir visualmente la zona de peligro.
 */
const DeleteAccountCard = () => {
    const { deleteAccount, isDeleteAccountPending } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleConfirmDelete = async () => {
        try {
            await deleteAccount();
            notify.success('Cuenta eliminada');
        } catch (error) {
            notify.error(
                error instanceof ApiError
                    ? error.message
                    : 'No se pudo eliminar la cuenta. Inténtalo de nuevo.',
            );
        }
    };

    return (
        <Card padded className='border-error-20'>
            <h2 className='font-display text-text text-lg font-bold'>
                Eliminar cuenta
            </h2>
            <p className='text-text-60 mt-1 text-sm'>
                Esta acción es permanente: se cerrará tu sesión y perderás el
                acceso a tu historial de pedidos.
            </p>

            <div className='mt-6 flex justify-end'>
                <Button variant='danger' onClick={() => setConfirmOpen(true)}>
                    Eliminar mi cuenta
                </Button>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                title='Eliminar cuenta'
                message={
                    <p className='text-text-60 text-sm'>
                        ¿Seguro que quieres eliminar tu cuenta?
                        <span className='text-error'>
                            {' '}
                            Esta acción no se puede deshacer.
                        </span>
                    </p>
                }
                confirmLabel='Eliminar cuenta'
                loading={isDeleteAccountPending}
                onConfirm={handleConfirmDelete}
                onClose={() => setConfirmOpen(false)}
            />
        </Card>
    );
};

export default DeleteAccountCard;
