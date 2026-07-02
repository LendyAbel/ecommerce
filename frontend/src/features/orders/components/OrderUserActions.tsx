import { Button, Modal } from '@/shared/ui';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Order } from '../schemas/orderSchemas';
import { useCancelOrder } from '../hooks/useOrder';

interface OrderUserActionsProps {
    order: Order;
}

const OrderUserActions = ({ order }: OrderUserActionsProps) => {
    const navigate = useNavigate();
    const [confirmCancel, setConfirmCancel] = useState(false);
    const cancelOrder = useCancelOrder();

    const handleCancel = async () => {
        if (!order) return;
        await cancelOrder.mutateAsync(order.id);
        setConfirmCancel(false);
    };

    return (
        <>
            <Button onClick={() => navigate(`/checkout?orderId=${order.id}`)}>
                Continuar con el pago
            </Button>
            <Button variant='danger' onClick={() => setConfirmCancel(true)}>
                Cancelar pedido
            </Button>
            <Modal
                open={confirmCancel}
                onClose={() => setConfirmCancel(false)}
                title='Cancelar pedido'
            >
                <div className='px-6 pt-2 pb-6'>
                    <p className='text-text-60 text-sm'>
                        ¿Seguro que quieres cancelar este pedido? Esta acción no
                        se puede deshacer.
                    </p>
                    <div className='mt-6 flex justify-end gap-3'>
                        <Button
                            variant='outline'
                            onClick={() => setConfirmCancel(false)}
                        >
                            Volver
                        </Button>
                        <Button
                            variant='danger'
                            loading={cancelOrder.isPending}
                            onClick={handleCancel}
                        >
                            Cancelar pedido
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default OrderUserActions;
