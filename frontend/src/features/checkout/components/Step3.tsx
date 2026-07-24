import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useNavigate } from 'react-router';

import { useCreateCheckout } from '@/features/checkout/hooks/useCheckout';
import { getOrCreateIdempotencyKey } from '@/features/checkout/utils';
import OrderItemsCard from '@/features/orders/components/OrderItemsCard';
import type { Order } from '@/features/orders/schemas/orderSchemas';
import { useProductsStock } from '@/features/products/hooks/useProduct';
import { ApiError } from '@/lib/api/client';
import { notify } from '@/shared/store/alertStore';
import { Button } from '@/shared/ui';
import { formatCurrency } from '@/shared/utils/format';

type Step3Props = {
    order: Order;
};

const Step3 = ({ order }: Step3Props) => {
    const navigate = useNavigate();
    const idempotencyKey = getOrCreateIdempotencyKey(order.id);
    const createCheckout = useCreateCheckout();

    const { stockByProductId } = useProductsStock(
        order.orderItems.map(item => item.productId),
    );
    const hasInsufficientStock = order.orderItems.some(item => {
        if (!item.productId) return false;
        const stock = stockByProductId.get(item.productId);
        return stock !== undefined && stock < item.quantity;
    });

    const handlePay = async () => {
        if (hasInsufficientStock) {
            notify.error('No hay suficiente stock disponible');
            return;
        }
        try {
            const { url } = await createCheckout.mutateAsync({
                orderId: order.id,
                idempotencyKey,
            });
            window.location.href = url;
        } catch (error) {
            notify.error(
                error instanceof ApiError
                    ? error.message
                    : 'No se pudo iniciar el pago. Inténtalo de nuevo.',
            );
        }
    };

    return (
        <div className='flex flex-col gap-6'>
            {hasInsufficientStock && (
                <div className='border-warning bg-warning-20 text-warning flex items-center gap-2 rounded-2xl border p-4 text-sm font-medium'>
                    <WarningAmberIcon fontSize='small' />
                    Lo sentimos, en este momento no hay stock suficiente de
                    alguno de los artículos de tu pedido. Espera a que volvamos
                    a reponer.
                </div>
            )}
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
                <Button onClick={handlePay}>Pagar</Button>
            </div>
        </div>
    );
};

export default Step3;
