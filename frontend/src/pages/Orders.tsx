import { OrdersList } from '@/features/orders';
import { useAuthStore } from '@/features/auth';
import { PageContainer } from '@/shared/components';

const Orders = () => {
    const isAdmin = useAuthStore(state => state.user?.role === 'admin');

    return (
        <PageContainer maxWidth='3xl'>
            <header className='mb-6'>
                <h1 className='text-text font-display text-2xl font-extrabold'>
                    {isAdmin ? 'Pedidos' : 'Mis pedidos'}
                </h1>
                <p className='text-text-60 text-sm'>
                    {isAdmin
                        ? 'Todos los pedidos realizados en la tienda.'
                        : 'Consulta el estado y el detalle de tus compras.'}
                </p>
            </header>

            <OrdersList />
        </PageContainer>
    );
};

export default Orders;
