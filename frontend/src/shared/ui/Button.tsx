import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'outline'
    | 'ghost'
    | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    /** Muestra un spinner, deshabilita el botón y marca `aria-busy`. */
    loading?: boolean;
    /** Icono opcional a la izquierda del texto (se oculta mientras `loading`). */
    leftIcon?: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
};

const sizeClass: Record<ButtonSize, string> = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
};

/**
 * Botón base de la app. Mapea `variant`/`size`/`fullWidth` a las clases `.btn-*`
 * del design system (index.css) y gestiona el estado de carga: cuando `loading`
 * es `true` muestra un spinner y se deshabilita (también si `disabled`).
 *
 * `type` por defecto es `'button'` para evitar envíos accidentales de formularios;
 * los botones de submit deben pasar `type='submit'` explícitamente.
 */
const Button = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    leftIcon,
    disabled,
    className = '',
    children,
    type = 'button',
    ...rest
}: ButtonProps) => {
    const classes = [
        'btn',
        variantClass[variant],
        sizeClass[size],
        fullWidth ? 'btn-full' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading ? <Spinner /> : leftIcon}
            {children}
        </button>
    );
};

export default Button;
