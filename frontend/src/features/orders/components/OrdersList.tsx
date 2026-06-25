import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui';
import { useGetOrdersList } from '../hooks/useGetOrdersList';
import OrderRow from './OrderRow';
import OrdersListSkeleton from './skeletons/OrdersListSkeleton';

const OrdersList = () => {
    const navigate = useNavigate();
    const { orders, isAdmin, isLoading, isError } = useGetOrdersList();

    if (isLoading) return <OrdersListSkeleton />;

    if (isError) {
        return (
            <div className='border-error-20 bg-error-20/40 text-error rounded-2xl border p-6 text-center'>
                No pudimos cargar los pedidos. Inténtalo de nuevo en unos
                instantes.
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className='border-border bg-surface flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center'>
                <h2 className='text-text font-display text-lg font-bold'>
                    {isAdmin
                        ? 'Todavía no hay pedidos'
                        : 'Aún no tienes pedidos'}
                </h2>
                <p className='text-text-60 max-w-sm text-sm'>
                    {isAdmin
                        ? 'Cuando los clientes realicen compras, aparecerán aquí.'
                        : 'Cuando hagas tu primera compra, podrás seguir su estado desde aquí.'}
                </p>
                {!isAdmin && (
                    <Button
                        className='mt-1'
                        onClick={() => navigate('/products')}
                    >
                        Explorar productos
                    </Button>
                )}
            </div>
        );
    }

    return (
        <ul className='flex flex-col gap-3'>
            {orders.map((order, i) => (
                <li
                    key={order.id}
                    className='animate-slide-up'
                    // Escalonado suave de entrada, limitado para que las filas
                    // de más abajo no tarden demasiado en aparecer.
                    style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
                >
                    <OrderRow order={order} />
                </li>
            ))}
        </ul>
    );
};

export default OrdersList;
