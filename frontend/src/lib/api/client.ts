import axios, { AxiosError } from 'axios';

import { translateApiMessage } from './errorMessages';

/**
 * Cliente HTTP central. Todas las llamadas pasan por `/api` (el proxy de Vite
 * lo redirige al backend en dev) con las cookies de sesión (`withCredentials`).
 *
 * Un interceptor de respuesta normaliza los errores del backend a un `ApiError`
 * con un `message` legible y el `status` HTTP, para que servicios/hooks/UI no
 * tengan que conocer la forma interna de la respuesta de Axios.
 */
export const apiClient = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

/** Issue individual de una respuesta de validación Zod (ver `errorHandler.ts`). */
type BackendValidationIssue = {
    message?: string;
    path?: unknown[];
};

/** Forma de los errores que devuelve el backend (ver `errorHandler.ts`). */
type BackendError = {
    error?: string; // mensaje principal (AppError, Zod, Prisma…)
    message?: string; // mensaje extra en algunos casos
    issues?: BackendValidationIssue[]; // detalle de validación Zod
    fields?: string; // campos en conflicto (constraint único)
};

export class ApiError extends Error {
    status?: number;
    /** Detalle opcional para formularios (issues de Zod, campos en conflicto…). */
    details?: unknown;

    constructor(message: string, status?: number, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

apiClient.interceptors.response.use(
    response => response,
    (error: AxiosError<BackendError>) => {
        const status = error.response?.status;
        const data = error.response?.data;
        const rawMessage =
            data?.issues?.[0]?.message ??
            data?.error ??
            data?.message ??
            error.message ??
            'Ha ocurrido un error inesperado';
        return Promise.reject(
            new ApiError(
                translateApiMessage(rawMessage),
                status,
                data?.issues ?? data?.fields,
            ),
        );
    },
);
