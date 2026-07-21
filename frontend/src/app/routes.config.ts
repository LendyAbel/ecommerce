import type { ComponentType } from 'react';

type RouteImport = () => Promise<{ default: ComponentType }>;

export interface AppRouteConfig {
    path: string;
    import: RouteImport;
    /** Si es true, la ruta se agrupa bajo <ProtectedRoute /> en App.tsx. */
    protected?: boolean;
}

/**
 * Única fuente de verdad para las rutas de la app: cada entrada alimenta a
 * la vez el `lazy()` + `<Route>` de App.tsx y el mapa de precarga de
 * routePreload.ts. Para añadir una página nueva, basta con añadir una
 * entrada aquí.
 */
export const appRoutes: AppRouteConfig[] = [
    { path: '/', import: () => import('@/pages/Home') },
    { path: '/products', import: () => import('@/pages/Products') },
    {
        path: '/products/:id',
        import: () => import('@/features/products/components/ProductDetails'),
    },
    { path: '/about', import: () => import('@/pages/About') },
    { path: '/auth', import: () => import('@/pages/Authenticate') },
    { path: '/cart', import: () => import('@/pages/Cart') },
    {
        path: '/orders',
        import: () => import('@/pages/Orders'),
        protected: true,
    },
    {
        path: '/account/addresses',
        import: () => import('@/pages/Address'),
        protected: true,
    },
    {
        path: '/checkout',
        import: () => import('@/pages/Checkout'),
        protected: true,
    },
    {
        path: '/checkout/success',
        import: () => import('@/pages/CheckoutSuccess'),
        protected: true,
    },
    {
        path: '/checkout/cancel',
        import: () => import('@/pages/CheckoutCancel'),
        protected: true,
    },
];
