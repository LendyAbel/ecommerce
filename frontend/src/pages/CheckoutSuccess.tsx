import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { clearIdempotencyKey } from '@/features/checkout/utils';
import OrderItemsCard from '@/features/orders/components/OrderItemsCard';
import { useOrder } from '@/features/orders/hooks/useOrder';
import { ErrorState, PageContainer } from '@/shared/components';
import { Button, Spinner } from '@/shared/ui';
import { formatCurrency } from '@/shared/utils/format';

const CheckoutSuccess = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const orderId = params.get('orderId') ?? '';

    const { order, isLoading, isError } = useOrder(orderId, {
        pollWhilePending: true,
    });

    const isConfirming = order?.status === 'pending';

    useEffect(() => {
        if (order && !isConfirming) clearIdempotencyKey(order.id);
    }, [order, isConfirming]);

    return (
        <PageContainer maxWidth='3xl'>
            <title>Pedido Tramitado · Voltora</title>
            {!orderId || isError ? (
                <ErrorState
                    message='No encontramos este pedido o no pudimos cargarlo.'
                    action={
                        <Button onClick={() => navigate('/orders')}>
                            Ver mis pedidos
                        </Button>
                    }
                />
            ) : isLoading || !order ? (
                <div className='flex justify-center py-16'>
                    <Spinner
                        className='text-primary size-10'
                        label='Cargando pedido'
                    />
                </div>
            ) : (
                <div className='flex flex-col gap-6'>
                    <div className='border-border bg-surface flex flex-col items-center gap-2 rounded-2xl border p-8 text-center'>
                        {isConfirming ? (
                            <>
                                <Spinner
                                    className='text-primary size-12'
                                    label='Confirmando pago'
                                />
                                <h1 className='text-text font-display mt-2 text-xl font-bold'>
                                    Confirmando tu pago…
                                </h1>
                                <p className='text-text-60 max-w-sm text-sm'>
                                    Estamos verificando el pago con Stripe. Esto
                                    puede tardar unos segundos, no cierres esta
                                    página.
                                </p>
                            </>
                        ) : (
                            <>
                                <CheckCircleOutlineIcon
                                    className='text-primary'
                                    sx={{ fontSize: 56 }}
                                />
                                <h1 className='text-text font-display mt-2 text-xl font-bold'>
                                    ¡Pago confirmado!
                                </h1>
                                <p className='text-text-60 text-sm'>
                                    Tu pedido #{order.orderNumber} se pagó
                                    correctamente.
                                </p>
                            </>
                        )}
                        <p className='text-text font-display mt-2 text-3xl font-extrabold'>
                            {formatCurrency(order.totalAmount)}
                        </p>
                    </div>

                    <OrderItemsCard
                        items={order.orderItems}
                        total={order.totalAmount}
                    />

                    <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
                        <Button
                            variant='outline'
                            onClick={() => navigate('/products')}
                        >
                            Seguir comprando
                        </Button>
                        <Button onClick={() => navigate(`/orders/${order.id}`)}>
                            Ver pedido
                        </Button>
                    </div>
                </div>
            )}
        </PageContainer>
    );
};

export default CheckoutSuccess;
