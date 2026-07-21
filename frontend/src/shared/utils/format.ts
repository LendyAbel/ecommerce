// Formatters creados una sola vez a nivel de módulo (no por render). Construir
// un Intl.* en cada llamada es caro y aquí el formato no depende de la petición.
const currencyFormatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});

export const formatCurrency = (value: number | string) =>
    currencyFormatter.format(Number(value));

export const formatOrderDate = (value: string | Date) =>
    dateFormatter.format(new Date(value));

export const formatOrderDateTime = (value: string | Date) =>
    dateTimeFormatter.format(new Date(value));
