import { useCartStore } from '@/features/cart';
import CartItemsList from '@/features/cart/components/CartItemsList';
import CartResumen from '@/features/cart/components/CartResumen';
import { PageContainer } from '@/shared/components';

const Cart = () => {
    const cart = useCartStore(state => state.cart);
    const items = cart.cartItems ?? [];

    return (
        <PageContainer maxWidth='5xl'>
            <h1 className='font-display text-text mb-6 text-2xl font-bold'>
                Tu carrito
            </h1>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                <CartItemsList />
                {items.length !== 0 && <CartResumen />}
            </div>
        </PageContainer>
    );
};

export default Cart;
