import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useNavigate } from 'react-router';

import { EmptyState } from '@/shared/components';
import { Button } from '@/shared/ui';

import { useCartStore } from '../store/cartStore';
import CartItemCard from './CartItemCard';

const CartItemsList = () => {
    const navigate = useNavigate();

    const cart = useCartStore(state => state.cart);
    const items = cart.cartItems ?? [];

    if (items.length === 0) {
        return (
            <div className='md:col-span-3'>
                <EmptyState
                    icon={<ShoppingCartOutlinedIcon sx={{ fontSize: 48 }} />}
                    title='Tu carrito está vacío'
                    message='Explora el catálogo y añade productos para empezar tu compra.'
                    action={
                        <Button
                            className='mt-1'
                            onClick={() => navigate('/products')}
                        >
                            Ver productos
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className='flex flex-col gap-4 md:col-span-2'>
            {items.map(item => {
                return (
                    <CartItemCard key={item.product.id} item={item} />
                );
            })}
        </div>
    );
};

export default CartItemsList;
