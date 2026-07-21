import { memo } from 'react';

import type { OrderStatus } from '@/features/orders/schemas/orderSchemas';
import { ORDER_FLOW, ORDER_STATUS_CONFIG } from '@/features/orders/utils/orderStatus';
import { StepProgressLine } from '@/shared/ui';

type OrderStatusTimelineProps = {
    status: OrderStatus;
};

/**
 * Progreso de cumplimiento del pedido. El ciclo de vida es una secuencia real
 * (pendiente → pagado → enviado → entregado), así que se representa como una
 * línea de tiempo con pasos numerados. Un pedido cancelado rompe el flujo y se
 * muestra como estado terminal aparte.
 */
const OrderStatusTimeline = ({ status }: OrderStatusTimelineProps) => {
    if (status === 'cancelled') {
        return (
            <div className='bg-error-20 text-error flex items-center gap-3 rounded-2xl p-5'>
                <svg
                    className='size-6 shrink-0'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    aria-hidden='true'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                </svg>
                <p className='text-sm font-semibold'>
                    Este pedido fue cancelado.
                </p>
            </div>
        );
    }

    const steps = ORDER_FLOW.map((step) => ORDER_STATUS_CONFIG[step].label);
    const currentIndex = ORDER_FLOW.indexOf(status);

    return (
        <StepProgressLine
            steps={steps}
            currentIndex={currentIndex}
            currentIsComplete
        />
    );
};

export default memo(OrderStatusTimeline);
