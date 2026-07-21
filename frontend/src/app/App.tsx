import { useIsMutating } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';

import { useAuthBootsTrap } from '@/features/auth/hooks/useAuth';
import Navbar from '@/layouts/Navbar';
import { Alerts, GeneralLoader } from '@/shared/components';
import { Spinner } from '@/shared/ui';

const PageFallback = () => (
    <div className='flex min-h-[calc(100vh-48px)] items-center justify-center'>
        <Spinner className='text-primary size-10' label='Cargando' />
    </div>
);

function App() {
    useAuthBootsTrap();

    const isLoggingOut = useIsMutating({ mutationKey: ['logout'] }) > 0;
    const isDeletingProduct =
        useIsMutating({ mutationKey: ['deleteProduct'] }) > 0;

    return (
        <Navbar>
            <Alerts />

            {isLoggingOut && <GeneralLoader label='Cerrando sesión' />}
            {isDeletingProduct && <GeneralLoader label='Eliminando producto' />}

            <Suspense fallback={<PageFallback />}>
                <Outlet />
            </Suspense>

            {/* getKey por pathname: BackLink navega con <Link> (push) a una
                ruta fija, no con "atrás" del navegador, así que se restaura
                por pathname en vez del comportamiento por defecto (por key
                de la entrada de historial, solo en navegación POP). */}
            <ScrollRestoration getKey={location => location.pathname} />
        </Navbar>
    );
}

export default App;
