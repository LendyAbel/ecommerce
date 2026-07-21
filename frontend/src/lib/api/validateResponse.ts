import type { z } from 'zod';

import { logger } from '@/lib/logger';

/**
 * Valida la respuesta del backend contra el schema Zod del contrato.
 * Si no coincide: siempre loguea (útil para monitoreo en prod), y en dev
 * lanza para detectar el drift de contrato mientras se programa. En prod
 * no lanza — devuelve el dato igual (cast) para no romper la página de un
 * usuario real por un mismatch de schema.
 */
export function validateResponse<T>(
    schema: z.ZodType<T>,
    data: unknown,
    label: string,
): T {
    const result = schema.safeParse(data);

    if (result.success) return result.data;

    logger.error(`[API contract] ${label}`, result.error.issues);

    if (import.meta.env.DEV) {
        throw new Error(
            `Respuesta de "${label}" no coincide con el schema esperado (ver detalles arriba)`,
        );
    }

    return data as T;
}
