import type { HTMLAttributes } from 'react';

type MaxWidth = '3xl' | '5xl' | '6xl';

type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
    /** Ancho máximo del contenido centrado. Por defecto `5xl`. */
    maxWidth?: MaxWidth;
};

const maxWidthClass: Record<MaxWidth, string> = {
    '3xl': 'max-w-3xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
};

/**
 * Contenedor de página estándar: ocupa el alto restante bajo la barra de navegación
 * (`min-h-[calc(100vh-48px)]`), centra el contenido al 90% de ancho con un padding
 * vertical uniforme y un ancho máximo configurable. Unifica el layout de las páginas
 * para que elementos comunes (p. ej. `<BackLink/>`) queden siempre a la misma altura.
 */
const PageContainer = ({
    maxWidth = '5xl',
    className = '',
    children,
    ...rest
}: PageContainerProps) => (
    <div className='bg-bg min-h-[calc(100vh-48px)]' >
        <div
            className={`animate-fade-in mx-auto w-[90%] py-8 ${maxWidthClass[maxWidth]} ${className}`}
            {...rest}
        >
            {children}
        </div>
    </div>
);

export default PageContainer;
