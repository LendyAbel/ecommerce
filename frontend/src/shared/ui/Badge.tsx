import type { HTMLAttributes } from 'react';

type BadgeVariant =
    | 'primary'
    | 'success'
    | 'warning'
    | 'error'
    | 'hot'
    | 'new'
    | 'best';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
    variant?: BadgeVariant;
};

const variantClass: Record<BadgeVariant, string> = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    hot: 'badge-hot',
    new: 'badge-new',
    best: 'badge-best',
};

/**
 * Etiqueta pequeña de estado/categoría. Mapea `variant` a las clases `.badge-*`
 * del design system (index.css). Acepta cualquier prop de `span` y fusiona
 * `className`.
 */
const Badge = ({
    variant = 'primary',
    className = '',
    children,
    ...rest
}: BadgeProps) => {
    const classes = ['badge', variantClass[variant], className]
        .filter(Boolean)
        .join(' ');

    return (
        <span className={classes} {...rest}>
            {children}
        </span>
    );
};

export default Badge;
