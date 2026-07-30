import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useNavigate, useSearchParams } from 'react-router';

import { PageContainer } from '@/shared/components';
import { Button } from '@/shared/ui';

const CheckoutCancel = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const orderId = params.get('orderId');

    return (
        <PageContainer maxWidth='3xl'>
            <title>Pedido Cancelado · Voltora</title>
            <div className='border-border bg-surface flex flex-col items-center gap-2 rounded-2xl border p-8 text-center'>
                <CancelOutlinedIcon
                    className='text-error'
                    sx={{ fontSize: 56 }}
                />
                <h1 className='text-text font-display mt-2 text-xl font-bold'>
                    Pago cancelado
                </h1>
                <p className='text-text-60 max-w-sm text-sm'>
                    No se completó el cobro y no se te ha realizado ningún
                    cargo. Tu pedido sigue pendiente de pago, puedes
                    reintentarlo cuando quieras.
                </p>

                <div className='mt-4 flex flex-col gap-3 sm:flex-row'>
                    <Button
                        variant='outline'
                        onClick={() => navigate('/products')}
                    >
                        Seguir comprando
                    </Button>
                    {orderId && (
                        <Button
                            onClick={() =>
                                navigate(`/checkout?orderId=${orderId}`)
                            }
                        >
                            Reintentar pago
                        </Button>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default CheckoutCancel;