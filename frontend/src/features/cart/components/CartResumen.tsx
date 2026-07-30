import { useNavigate } from 'react-router';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useSyncCart } from '@/features/cart/hooks/useSyncCart';
import { useCartStore } from '@/features/cart/store/cartStore';
import { ApiError } from '@/lib/api/client';
import { notify } from '@/shared/store/alertStore';
import { Button, Card } from '@/shared/ui';
import { formatCurrency } from '@/shared/utils/format';

const CartResumen = () => {
    const user = useAuthStore(state => state.user);
    const { clearCartInBackend } = useSyncCart();

    const navigate = useNavigate();

    const clearCart = useCartStore(state => state.clearCart);
    const totalPrice = useCartStore(state => state.totalPrice);

    const handleClearCart = async () => {
        clearCart();
        notify.warning('Carrito vaciado');
        if (user) {
            try {
                await clearCartInBackend();
            } catch (error) {
                notify.error(
                    error instanceof ApiError
                        ? error.message
                        : 'No se pudo vaciar el carrito en el servidor. Inténtalo de nuevo.',
                );
            }
        }
    };

    return (
        <Card padded className='h-fit'>
            <h2 className='font-display text-text mb-4 text-lg font-bold'>
                Resumen
            </h2>
            <hr className='border-border' />

            <div className='text-text-60 my-4 flex justify-between text-sm'>
                <span>Subtotal</span>
                <span className='text-text font-semibold'>
                    {formatCurrency(totalPrice())}
                </span>
            </div>

            <hr className='border-border' />

            <div className='mt-4 flex flex-col gap-3'>
                <Button fullWidth onClick={() => navigate('/checkout')}>
                    Proceder al pago
                </Button>
                <Button variant='danger' fullWidth onClick={handleClearCart}>
                    Vaciar carrito
                </Button>
            </div>
        </Card>
    );
};

export default CartResumen;
