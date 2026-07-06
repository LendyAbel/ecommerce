import { useNavigate } from 'react-router';

import { useAuthStore } from '@/features/auth';
import { notify } from '@/shared/store/alertStore';
import { Button, Card } from '@/shared/ui';

import { useSyncCart } from '../hooks/useSyncCart';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../utils';

const CartResumen = () => {
    const { user } = useAuthStore();
    const { clearCartInBackend } = useSyncCart();

    const navigate = useNavigate();

    const clearCart = useCartStore(state => state.clearCart);
    const totalPrice = useCartStore(state => state.totalPrice);

    const handleClearCart = async () => {
        clearCart();
        notify.warning('Carrito vaciado');
        if (user) {
            await clearCartInBackend();
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
                    {formatPrice(totalPrice())}
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
