import InventoryIcon from '@mui/icons-material/Inventory';
import { useNavigate } from 'react-router';

import { useOrders } from '@/features/orders/hooks/useOrder';
import { EmptyState, ErrorState } from '@/shared/components';
import { Button } from '@/shared/ui';
import LoadMoreButton from '@/shared/ui/LoadMoreButton';

import OrderRow from './OrderRow';
import OrdersListSkeleton from './skeletons/OrdersListSkeleton';

const OrdersList = () => {
    const navigate = useNavigate();
    const {
        orders,
        isAdmin,
        isLoading,
        isError,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        refetch,
    } = useOrders({});

    if (isLoading) return <OrdersListSkeleton />;

    if (isError) {
        return (
            <ErrorState
                message='No pudimos cargar los pedidos. Inténtalo de nuevo en unos instantes.'
                action={
                    <Button variant='outline' onClick={() => refetch()}>
                        Reintentar
                    </Button>
                }
            />
        );
    }

    if (orders.length === 0) {
        return (
            <EmptyState
                icon={<InventoryIcon fontSize='large' />}
                title={
                    isAdmin ? 'Todavía no hay pedidos' : 'Aún no tienes pedidos'
                }
                message={
                    isAdmin
                        ? 'Cuando los clientes realicen compras, aparecerán aquí.'
                        : 'Cuando hagas tu primera compra, podrás seguir su estado desde aquí.'
                }
                action={
                    !isAdmin && (
                        <Button
                            className='mt-1'
                            onClick={() => navigate('/products')}
                        >
                            Explorar productos
                        </Button>
                    )
                }
            />
        );
    }

    return (
        <>
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
            <LoadMoreButton
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onClick={() => fetchNextPage()}
            />
        </>
    );
};

export default OrdersList;
