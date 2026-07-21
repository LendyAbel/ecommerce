import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';

import OrderDetails from '@/features/orders/components/OrderDetails';
import { ProtectedRoute } from '@/shared/components';

import App from './App';
import { appRoutes } from './routes.config';

// lazy() se llama una sola vez por ruta a nivel de módulo (no en cada
// render) para no generar un componente nuevo -y remontar la vista- cada vez.
const routeComponents = appRoutes.map(route => ({
    ...route,
    Component: lazy(route.import),
}));

const publicRoutes = routeComponents.filter(route => !route.protected);
const protectedRoutes = routeComponents.filter(route => route.protected);

export const router = createBrowserRouter([
    {
        element: <App />,
        children: [
            ...publicRoutes.map(({ path, Component }) => ({
                path,
                element: <Component />,
            })),
            {
                element: <ProtectedRoute />,
                children: [
                    ...protectedRoutes.map(({ path, Component }) => ({
                        path,
                        element: <Component />,
                    })),
                    // OrderDetails se importa eager (no en routes.config) porque
                    // su hook ya se comparte con Wizard/CheckoutSuccess.
                    { path: '/orders/:id', element: <OrderDetails /> },
                ],
            },
        ],
    },
]);
