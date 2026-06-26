import type { ReactNode } from 'react';

type ErrorStateProps = {
    /** Texto explicativo del error en la voz de la interfaz. */
    message: string;
    /** Acción opcional (ej. botón de reintento). */
    action?: ReactNode;
    className?: string;
};

/**
 * Estado de error unificado: tarjeta con borde y fondo `error-20`. Sustituye a los
 * mensajes de error sueltos repartidos por las páginas para que todos compartan el
 * mismo lenguaje visual.
 */
export const ErrorState = ({
    message,
    action,
    className = '',
}: ErrorStateProps) => (
    <div
        className={`border-error-20 bg-error-20/40 text-error flex flex-col items-center gap-3 rounded-2xl border p-6 text-center ${className}`}
    >
        <p className='text-sm font-medium'>{message}</p>
        {action}
    </div>
);

type EmptyStateProps = {
    /** Icono opcional sobre el título. */
    icon?: ReactNode;
    title: string;
    /** Texto secundario que orienta al usuario hacia la acción. */
    message?: string;
    /** Acción opcional (ej. enlace a productos). */
    action?: ReactNode;
    className?: string;
};

/**
 * Estado vacío unificado: tarjeta con borde discontinuo, título y, opcionalmente,
 * icono, texto de apoyo y una acción. Una pantalla vacía es una invitación a actuar.
 */
export const EmptyState = ({
    icon,
    title,
    message,
    action,
    className = '',
}: EmptyStateProps) => (
    <div
        className={`border-border bg-surface flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center ${className}`}
    >
        {icon && <span className='text-text-38'>{icon}</span>}
        <h2 className='text-text font-display text-lg font-bold'>{title}</h2>
        {message && <p className='text-text-60 max-w-sm text-sm'>{message}</p>}
        {action}
    </div>
);
