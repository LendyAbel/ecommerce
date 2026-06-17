import { useNavigate } from 'react-router';
import { ShoppingCart } from '@mui/icons-material';
import { useCartStore } from '@/features/cart/store/cartStore';

const CartBadge = () => {
    const navigate = useNavigate();
    const totalItems = useCartStore(state => state.totalItems());

    return (
        <button
            type='button'
            onClick={() => navigate('/cart')}
            aria-label={`Carrito, ${totalItems} artículos`}
            className='text-text-60 hover:text-primary relative cursor-pointer transition-colors duration-200'
        >
            <ShoppingCart fontSize='small' />
            {totalItems > 0 && (
                <span className='bg-primary absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white'>
                    {totalItems > 99 ? '99+' : totalItems}
                </span>
            )}
        </button>
    );
};

export default CartBadge;
