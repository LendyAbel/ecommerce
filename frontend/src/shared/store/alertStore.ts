import { create } from 'zustand';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export type Alert = {
    id: string;
    type: AlertType;
    message: string;
    title?: string;
    duration: number; /** ms antes de auto-cerrarse. '0' = permanente hasta cerrarse */
};

type AlertStore = {
    alerts: Alert[];
    addAlert: (alert: Omit<Alert, 'id'>) => string;
    removeAlert: (id: string) => void;
};

export const useAlertStore = create<AlertStore>(set => ({
    alerts: [],
    addAlert: alert => {
        const id = crypto.randomUUID();
        set(state => ({ alerts: [...state.alerts, { ...alert, id }] }));
        return id;
    },
    removeAlert: id =>
        set(state => ({ alerts: state.alerts.filter(a => a.id !== id) })),
}));

const DEFAULT_DURATION = 3000;

type NotifyOptions = {
    title?: string;
    /** ms antes de auto-cerrarse. `0` = permanece hasta cerrarse a mano. */
    duration?: number;
};

const push = (type: AlertType, message: string, options?: NotifyOptions) =>
    useAlertStore.getState().addAlert({
        type,
        message,
        title: options?.title,
        duration: options?.duration ?? DEFAULT_DURATION,
    });

/**
 * API imperativa para lanzar alertas desde cualquier sitio (incluido fuera de
 * componentes React: servicios, mutaciones, etc.):
 *
 *   notify.success('Producto añadido al carrito');
 *   notify.error('No se pudo iniciar sesión', { title: 'Error' });
 */
export const notify = {
    success: (message: string, options?: NotifyOptions) =>
        push('success', message, options),
    error: (message: string, options?: NotifyOptions) =>
        push('error', message, options),
    warning: (message: string, options?: NotifyOptions) =>
        push('warning', message, options),
    info: (message: string, options?: NotifyOptions) =>
        push('info', message, options),
    dismiss: (id: string) => useAlertStore.getState().removeAlert(id),
};
