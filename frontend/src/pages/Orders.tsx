import { useAuthStore } from '@/features/auth/store/authStore';
import OrdersList from '@/features/orders/components/OrdersList';
import { PageContainer } from '@/shared/components';
import PageHeader from '@/shared/components/PageHeader';

const Orders = () => {
    const isAdmin = useAuthStore(state => state.user?.role === 'admin');

    return (
        <PageContainer maxWidth='3xl'>
            <title>Pedidos · Voltora</title>
            <PageHeader
                title={isAdmin ? 'Pedidos' : 'Mis pedidos'}
                subtitle={
                    isAdmin
                        ? 'Todos los pedidos realizados en la tienda.'
                        : 'Consulta el estado y el detalle de tus compras.'
                }
            />

            <OrdersList />
        </PageContainer>
    );
};

export default Orders;
