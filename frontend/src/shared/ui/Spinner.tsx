type SpinnerProps = {
    /** Clases de tamaño/color Tailwind. Por defecto `size-4` (1rem). */
    className?: string;
    /**
     * Texto para lectores de pantalla. Si se omite, el spinner es decorativo
     * (`aria-hidden`) — útil dentro de un botón que ya marca `aria-busy`.
     */
    label?: string;
};

/**
 * Indicador de carga. Hereda el color del texto (`currentColor`), así que se
 * adapta al contexto donde se use (dentro de un botón, un panel, etc.).
 */
const Spinner = ({ className = 'size-4', label }: SpinnerProps) => (
    <svg
        className={`animate-spin ${className}`}
        viewBox='0 0 24 24'
        fill='none'
        role={label ? 'status' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
    >
        <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
        />
        <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
        />
    </svg>
);

export default Spinner;
