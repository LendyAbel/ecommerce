// Precarga el chunk de una vista por intención del usuario (hover/focus),
// leyendo los imports desde `appRoutes` (fuente única en routes.config.ts).
// Vite dedup­lica los imports dinámicos por módulo, así que precargar y
// luego navegar no descarga el chunk dos veces.

import { appRoutes } from './routes.config';

const importByPath = new Map(appRoutes.map(route => [route.path, route.import]));

/** Precarga el chunk de una ruta conocida (no-op si la ruta no está mapeada). */
export const preloadRoute = (to: string) => importByPath.get(to)?.();

/** Precarga el chunk de la vista de detalle de producto (hover en una card). */
export const preloadProductDetails = () => importByPath.get('/products/:id')?.();
