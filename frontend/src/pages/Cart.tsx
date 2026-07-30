import CartItemsList from '@/features/cart/components/CartItemsList';
import CartResumen from '@/features/cart/components/CartResumen';
import { useCartStore } from '@/features/cart/store/cartStore';
import { PageContainer } from '@/shared/components';
import PageHeader from '@/shared/components/PageHeader';

const Cart = () => {
    const cart = useCartStore(state => state.cart);
    const items = cart.cartItems ?? [];

    return (
        <PageContainer maxWidth='5xl'>
            <title>Carrito · Voltora</title>
            <PageHeader title='Tu carrito' subtitle='Gestiona tus productos antes de la compra' />
            <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                <CartItemsList />
                {items.length !== 0 && <CartResumen />}
            </div>
        </PageContainer>
    );
};

export default Cart;
