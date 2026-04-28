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
            className='relative text-white/50 transition-colors duration-200 hover:text-white hover:cursor-pointer'
        >
            <ShoppingCart fontSize='small' />
            {totalItems > 0 && (
                <span className='absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white'>
                    {totalItems > 99 ? '99+' : totalItems}
                </span>
            )}
        </button>
    );
};

export default CartBage;
