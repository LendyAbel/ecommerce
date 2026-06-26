// Thunks de import reutilizables: alimentan `lazy()` en App y permiten precargar
// el chunk de una vista por intención del usuario (hover/focus). Vite dedup­lica
// los imports dinámicos por módulo, así que precargar y luego navegar no descarga
// el chunk dos veces.

export const routeImports = {
    '/': () => import('@/pages/Home'),
    '/products': () => import('@/pages/Products'),
    '/cart': () => import('@/pages/Cart'),
    '/about': () => import('@/pages/About'),
    '/auth': () => import('@/pages/Authenticate'),
    '/orders': () => import('@/pages/Orders'),
} as const;

/** Precarga el chunk de una ruta conocida (no-op si la ruta no está mapeada). */
export const preloadRoute = (to: string) =>
    routeImports[to as keyof typeof routeImports]?.();

export const importProductDetails = () =>
    import('@/features/products/components/ProductDetails');

/** Precarga el chunk de la vista de detalle de producto (hover en una card). */
export const preloadProductDetails = importProductDetails;
