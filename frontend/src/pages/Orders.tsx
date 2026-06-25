import { OrdersList } from '@/features/orders';
import { useAuthStore } from '@/features/auth';

const Orders = () => {
    const isAdmin = useAuthStore(state => state.user?.role === 'admin');

    return (
        <div className='bg-bg min-h-[calc(100vh-48px)]'>
            <div className='animate-fade-in m-auto w-[90%] max-w-3xl py-6'>
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
            </div>
        </div>
    );
};

export default Orders;
