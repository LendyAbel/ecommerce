import { useIsMutating } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { useAuthBootsTrap } from '@/features/auth/';
import { OrderDetails } from '@/features/orders/';
import Navbar from '@/layouts/Navbar';
import { Alerts, GeneralLoader, ProtectedRoute } from '@/shared/components';
import { Spinner } from '@/shared/ui';

import { appRoutes } from './routes.config';

// lazy() se llama una sola vez por ruta a nivel de módulo (no en el render de
// App) para no generar un componente nuevo -y remontar la vista- en cada render.
const routeComponents = appRoutes.map(route => ({
    ...route,
    Component: lazy(route.import),
}));

const publicRoutes = routeComponents.filter(route => !route.protected);
const protectedRoutes = routeComponents.filter(route => route.protected);

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
                <Routes>
                    {publicRoutes.map(({ path, Component }) => (
                        <Route key={path} path={path} element={<Component />} />
                    ))}

                    <Route element={<ProtectedRoute />}>
                        {protectedRoutes.map(({ path, Component }) => (
                            <Route
                                key={path}
                                path={path}
                                element={<Component />}
                            />
                        ))}
                        {/* OrderDetails se importa eager (no en routes.config) porque
                            su hook ya se comparte con Wizard/CheckoutSuccess. */}
                        <Route path='/orders/:id' element={<OrderDetails />} />
                    </Route>
                </Routes>
            </Suspense>
        </Navbar>
    );
}

export default App;
