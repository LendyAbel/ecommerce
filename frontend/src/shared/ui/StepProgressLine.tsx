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

type StepProgressLineProps = {
    /** Etiquetas de cada paso, en orden. */
    steps: readonly string[];
    /**
     * Índice (base 0) del paso actual. Los pasos anteriores se marcan como
     * completados; los posteriores quedan pendientes.
     */
    currentIndex: number;
    /**
     * Si el paso actual representa un hito ya cumplido (p. ej. el estado de un
     * pedido: estar "pagado" significa que ese paso ya está hecho). En ese caso
     * el paso actual muestra el check en lugar del número. Por defecto `false`,
     * apto para flujos en curso como el stepper del checkout.
     */
    currentIsComplete?: boolean;
};

/**
 * Línea de progreso por pasos: una secuencia de puntos numerados unidos por un
 * conector, donde los pasos alcanzados se pintan en color primario y el actual
 * se resalta con un anillo. Reutilizable para cualquier flujo secuencial (p. ej.
 * el stepper del checkout o la línea de tiempo de estado de un pedido).
 */
const StepProgressLine = ({
    steps,
    currentIndex,
    currentIsComplete = false,
}: StepProgressLineProps) => {
    return (
        <ol
            className='border-border bg-surface grid rounded-2xl border p-6'
            style={{
                gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
            }}
        >
            {steps.map((label, i) => {
                const isDone = i < currentIndex;
                const isCurrent = i === currentIndex;
                const isReached = i <= currentIndex;
                const showCheck = isDone || (isCurrent && currentIsComplete);

                const dotClass = isCurrent
                    ? 'border-primary bg-primary text-white ring-4 ring-primary-10'
                    : isDone
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-surface text-text-38';

                return (
                    <li
                        key={label}
                        className='relative flex flex-col items-center gap-2'
                    >
                        {/* Conector con el paso anterior. Se pinta de color
                            primario cuando ya hemos llegado a este paso. */}
                        {i > 0 && (
                            <span
                                aria-hidden='true'
                                className={`absolute top-4.5 right-1/2 h-0.5 w-full ${
                                    isReached ? 'bg-primary' : 'bg-border'
                                }`}
                            />
                        )}

                        <span
                            className={`relative z-10 flex size-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${dotClass}`}
                            aria-current={isCurrent ? 'step' : undefined}
                        >
                            {showCheck ? <CheckIcon /> : i + 1}
                        </span>

                        <span
                            className={`text-center text-xs font-medium ${
                                isReached ? 'text-text' : 'text-text-38'
                            }`}
                        >
                            {label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
};

export default StepProgressLine;
