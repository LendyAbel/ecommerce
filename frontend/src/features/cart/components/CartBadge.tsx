import ShoppingCart from '@mui/icons-material/ShoppingCart';
import { NavLink } from 'react-router';

import { useCartStore } from '@/features/cart/store/cartStore';

const CartBadge = () => {
    // Selector puro (no llama a un método del store) para que Zustand pueda
    // comparar el primitivo resultante y evitar renders innecesarios.
    const totalItems = useCartStore(state =>
        state.cart.cartItems.reduce((acc, item) => acc + item.quantity, 0),
    );

    return (
        <NavLink to={'/cart'}>
            <div
                aria-label={`Carrito, ${totalItems} artículos`}
                className='text-text-60 hover:text-primary relative cursor-pointer transition-all duration-200 hover:scale-110'
            >
                <ShoppingCart fontSize='small' />
                {totalItems > 0 && (
                    <span className='bg-primary absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[10px] font-bold text-white'>
                        {totalItems > 99 ? '99+' : totalItems}
                    </span>
                )}
            </div>
        </NavLink>
    );
};

export default CartBadge;
