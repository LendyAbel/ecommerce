export const formatPrice = (value: number) =>
    value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });