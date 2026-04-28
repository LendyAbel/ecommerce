import { useNavigate } from 'react-router';
import { ShoppingCart } from '@mui/icons-material';
import { useCartStore } from '../../store/cartStore';

const CartBage = () => {
    const navigate = useNavigate();
    const totalItems = useCartStore(state => state.totalItems());

    return (
        <button
            type='button'
            onClick={() => navigate('/cart')}
            aria-label={`Carrito, ${totalItems} artículos`}
            className='relative cursor-pointer text-text-60 transition-colors duration-200 hover:text-primary'
        >
            <ShoppingCart fontSize='small' />
            {totalItems > 0 && (
                <span className='absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white'>
                    {totalItems > 99 ? '99+' : totalItems}
                </span>
            )}
        </button>
    );
};

export default CartBage;
