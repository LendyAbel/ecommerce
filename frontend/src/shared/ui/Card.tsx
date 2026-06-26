import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
    /** Añade padding interior (`p-6`). Por defecto `false`. */
    padded?: boolean;
};

/**
 * Superficie tipo tarjeta: fondo `surface`, borde, esquinas redondeadas y sombra
 * suave. Encapsula el patrón `rounded-2xl border border-border bg-surface shadow-sm`
 * repetido por la app. Acepta cualquier prop de `div` y fusiona `className` para
 * añadir layout puntual (flex, padding distinto, etc.).
 */
const Card = ({
    padded = false,
    className = '',
    children,
    ...rest
}: CardProps) => {
    const classes = [
        'border-border bg-surface rounded-2xl border shadow-sm',
        padded ? 'p-6' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} {...rest}>
            {children}
        </div>
    );
};

export default Card;
