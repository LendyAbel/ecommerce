/**
 * Logger central. En producción (`import.meta.env.PROD`) `debug`/`info` son no-op
 * para evitar ruido y fugas de datos en consola; `warn`/`error` siempre se emiten
 * (útiles para monitoreo / Sentry en el futuro).
 */
const isDev = import.meta.env.DEV;

export const logger = {
    debug: (...args: unknown[]) => {
        if (isDev) console.debug(...args);
    },
    info: (...args: unknown[]) => {
        if (isDev) console.info(...args);
    },
    warn: (...args: unknown[]) => {
        console.warn(...args);
    },
    error: (...args: unknown[]) => {
        console.error(...args);
    },
};
