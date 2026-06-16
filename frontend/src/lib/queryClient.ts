import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api/client';

/**
 * Configuración central de React Query.
 *
 * - `staleTime`: durante 1 min los datos se consideran "frescos" y no se vuelven
 *   a pedir (evita refetches al navegar entre páginas).
 * - `refetchOnWindowFocus: false`: no recargar solo por volver a la pestaña.
 * - `retry`: no reintentar errores 4xx (un 404/401/409 no se arregla reintentando);
 *   sí reintentar fallos de red / 5xx hasta 2 veces.
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000, // 1 minuto
            gcTime: 5 * 60_000, // 5 minutos en caché tras quedar sin uso
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                if (
                    error instanceof ApiError &&
                    error.status &&
                    error.status >= 400 &&
                    error.status < 500
                ) {
                    return false;
                }
                return failureCount < 2;
            },
        },
        mutations: {
            retry: false,
        },
    },
});
