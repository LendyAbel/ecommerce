import { useNavigate } from 'react-router';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Button } from '@/shared/ui';
import type { Order } from '@/features/orders/schemas/orderSchemas';
import { formatCurrency } from '@/features/orders/utils/orderStatus';
import OrderItemsCard from '@/features/orders/components/OrderItemsCard';

type Step3Props = {
    order: Order;
};

/**
 * Paso final del checkout. La orden ya existe en estado «pendiente de pago»; el
 * cobro real se implementará con Stripe. De momento se muestra el resumen y un
 * botón de pago deshabilitado (placeholder).
 */
const Step3 = ({ order }: Step3Props) => {
    const navigate = useNavigate();

    return (
        <div className='flex flex-col gap-6'>
            <div className='border-border bg-surface flex flex-col items-center gap-2 rounded-2xl border p-6 text-center'>
                <CheckCircleOutlineIcon
                    className='text-primary'
                    sx={{ fontSize: 48 }}
                />
                <h2 className='text-text font-display text-xl font-bold'>
                    Pedido #{order.orderNumber} creado
                </h2>
                <p className='text-text-60 text-sm'>
                    Tu pedido está <strong>pendiente de pago</strong>. Completa
                    el pago para confirmarlo.
                </p>
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
                    onClick={() => navigate(`/orders/${order.id}`)}
                >
                    Ver pedido
                </Button>
                {/* El pago real llegará con la integración de Stripe. */}
                <Button disabled>Pagar (próximamente)</Button>
            </div>
        </div>
    );
};

export default Step3;
