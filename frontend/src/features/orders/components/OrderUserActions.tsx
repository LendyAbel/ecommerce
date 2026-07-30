import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useCancelOrder } from '@/features/orders/hooks/useOrder';
import type { Order } from '@/features/orders/schemas/orderSchemas';
import { ApiError } from '@/lib/api/client';
import { ConfirmDialog } from '@/shared/components/';
import { notify } from '@/shared/store/alertStore';
import { Button } from '@/shared/ui';

interface OrderUserActionsProps {
    order: Order;
}

const OrderUserActions = ({ order }: OrderUserActionsProps) => {
    const navigate = useNavigate();
    const [confirmCancel, setConfirmCancel] = useState(false);
    const cancelOrder = useCancelOrder();

    const handleCancel = async () => {
        if (!order) return;
        try {
            await cancelOrder.mutateAsync(order.id);
            setConfirmCancel(false);
            notify.success('Pedido cancelado');
        } catch (error) {
            notify.error(
                error instanceof ApiError
                    ? error.message
                    : 'No se pudo cancelar el pedido. Inténtalo de nuevo.',
            );
        }
    };

    return (
        <>
            <Button onClick={() => navigate(`/checkout?orderId=${order.id}`)}>
                Continuar con el pago
            </Button>
            <Button variant='danger' onClick={() => setConfirmCancel(true)}>
                Cancelar pedido
            </Button>
            <ConfirmDialog
                open={confirmCancel}
                title='Cancelar pedido'
                message={
                    <p className='text-text-60 text-sm'>
                        ¿Seguro que quieres cancelar este pedido?
                        <span className='text-error'>
                            {' '}
                            Esta acción no se puede deshacer.
                        </span>
                    </p>
                }
                confirmLabel='Cancelar Pedido'
                loading={cancelOrder.isPending}
                onConfirm={handleCancel}
                onClose={() => setConfirmCancel(false)}
            />
        </>
    );
};

export default OrderUserActions;
