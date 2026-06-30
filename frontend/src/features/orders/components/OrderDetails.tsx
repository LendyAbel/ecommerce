import { useParams } from 'react-router';
import { useGetOrderDetails } from '../hooks/useOrder';
import {
    formatCurrency,
    formatOrderDateTime,
    ORDER_STATUS_CONFIG,
} from '../utils/orderStatus';
import OrderStatusBadge from './OrderStatusBadge';
import OrderStatusTimeline from './OrderStatusTimeline';
import OrderItemsCard from './OrderItemsCard';
import OrderAddressCard from './OrderAddressCard';
import OrderDetailsSkeleton from './skeletons/OrderDetailsSkeleton';
import { BackLink, ErrorState, PageContainer } from '@/shared/components';

const OrderDetails = () => {
    const { id } = useParams();
    const { order, isLoading, isError } = useGetOrderDetails(id!);

    return (
        <PageContainer maxWidth='3xl'>
            <BackLink backLink='/orders' backPageName='Pedidos' />

            {isLoading ? (
                <OrderDetailsSkeleton />
            ) : isError || !order ? (
                <ErrorState message='No encontramos este pedido o no pudimos cargarlo.' />
            ) : (
                <div className='flex flex-col gap-6'>
                    {/* Cabecera */}
                    <header className='border-border bg-surface flex flex-col gap-4 rounded-2xl border p-6'>
                        <div className='flex items-start justify-between gap-4'>
                            <div>
                                <span className='text-text-38 text-xs font-semibold tracking-wide uppercase'>
                                    Pedido
                                </span>
                                <h1 className='text-text font-display text-2xl font-extrabold'>
                                    #{order.orderNumber}
                                </h1>
                            </div>
                            <OrderStatusBadge status={order.status} />
                        </div>

                        <p className='text-text-60 text-sm'>
                            Realizado el {formatOrderDateTime(order.createdAt)}
                            {order.status !== 'pending' && (
                                <>
                                    {' · '}
                                    {
                                        ORDER_STATUS_CONFIG[order.status].label
                                    } el {formatOrderDateTime(order.updatedAt)}
                                </>
                            )}
                        </p>
                        <p>
                            Direccion de envio: {order.shippingAddress?.line1},{' '}
                            {order.shippingAddress?.line2},{' '}
                            {order.shippingAddress?.city},{' '}
                            {order.shippingAddress?.state}{' '}
                        </p>

                        <p className='text-text font-display text-3xl font-extrabold'>
                            {formatCurrency(order.totalAmount)}
                        </p>

                        {/* Cliente: solo lo recibe el admin desde el backend. */}
                        {order.user && (
                            <div className='border-border flex flex-col gap-0.5 border-t pt-4'>
                                <span className='text-text-38 text-xs font-semibold tracking-wide uppercase'>
                                    Cliente
                                </span>
                                <span className='text-text font-display text-base font-bold'>
                                    {order.user.name}
                                </span>
                                <a
                                    href={`mailto:${order.user.email}`}
                                    className='text-text-60 hover:text-primary text-sm transition-colors'
                                >
                                    {order.user.email}
                                </a>
                            </div>
                        )}
                    </header>

                    <OrderStatusTimeline status={order.status} />

                    <OrderItemsCard
                        items={order.orderItems}
                        total={order.totalAmount}
                    />

                    {(order.shippingAddress || order.billingAddress) && (
                        <section className='grid gap-4 sm:grid-cols-2'>
                            {order.shippingAddress && (
                                <OrderAddressCard
                                    title='Dirección de envío'
                                    address={order.shippingAddress}
                                />
                            )}
                            {order.billingAddress && (
                                <OrderAddressCard
                                    title='Dirección de facturación'
                                    address={order.billingAddress}
                                />
                            )}
                        </section>
                    )}
                </div>
            )}
        </PageContainer>
    );
};

export default OrderDetails;
