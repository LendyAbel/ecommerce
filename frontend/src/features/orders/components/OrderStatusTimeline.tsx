import { memo } from 'react';
import type { OrderStatus } from '../schemas/orderSchemas';
import { ORDER_FLOW, ORDER_STATUS_CONFIG } from '../utils/orderStatus';

type OrderStatusTimelineProps = {
    status: OrderStatus;
};

const CheckIcon = () => (
    <svg
        className='size-4'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
        aria-hidden='true'
    >
        <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={3}
            d='M5 13l4 4L19 7'
        />
    </svg>
);

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

    const currentIndex = ORDER_FLOW.indexOf(status);

    return (
        <ol
            className='border-border bg-surface grid rounded-2xl border p-6'
            style={{
                gridTemplateColumns: `repeat(${ORDER_FLOW.length}, minmax(0, 1fr))`,
            }}
        >
            {ORDER_FLOW.map((step, i) => {
                const isDone = i < currentIndex;
                const isCurrent = i === currentIndex;
                const isReached = i <= currentIndex;

                const dotClass = isCurrent
                    ? 'border-primary bg-primary text-white ring-4 ring-primary-10'
                    : isDone
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-surface text-text-38';

                return (
                    <li
                        key={step}
                        className='relative flex flex-col items-center gap-2'
                    >
                        {/* Conector con el paso anterior. Se pinta de color
                            primario cuando ya hemos llegado a este paso. */}
                        {i > 0 && (
                            <span
                                aria-hidden='true'
                                className={`absolute top-[18px] right-1/2 h-0.5 w-full ${
                                    isReached ? 'bg-primary' : 'bg-border'
                                }`}
                            />
                        )}

                        <span
                            className={`relative z-10 flex size-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${dotClass}`}
                            aria-current={isCurrent ? 'step' : undefined}
                        >
                            {isDone ? <CheckIcon /> : i + 1}
                        </span>

                        <span
                            className={`text-center text-xs font-medium ${
                                isReached ? 'text-text' : 'text-text-38'
                            }`}
                        >
                            {ORDER_STATUS_CONFIG[step].label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
};

export default memo(OrderStatusTimeline);
