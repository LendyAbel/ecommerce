import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import {
    useAlertStore,
    type Alert,
    type AlertType,
} from '@/shared/store/alertStore';

const ALERT_CONFIG: Record<
    AlertType,
    { icon: typeof CheckCircleIcon; bar: string; iconColor: string }
> = {
    success: {
        icon: CheckCircleIcon,
        bar: 'bg-success',
        iconColor: 'text-success',
    },
    error: { icon: ErrorIcon, bar: 'bg-error', iconColor: 'text-error' },
    warning: {
        icon: WarningIcon,
        bar: 'bg-warning',
        iconColor: 'text-warning',
    },
    info: { icon: InfoIcon, bar: 'bg-info', iconColor: 'text-info' },
};

const AlertItem = ({ alert }: { alert: Alert }) => {
    const removeAlert = useAlertStore(state => state.removeAlert);
    const { icon: Icon, bar, iconColor } = ALERT_CONFIG[alert.type];

    useEffect(() => {
        if (alert.duration <= 0) return;
        const timer = setTimeout(() => removeAlert(alert.id), alert.duration);
        return () => clearTimeout(timer);
    }, [alert.id, alert.duration, removeAlert]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 24, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role={alert.type === 'error' ? 'alert' : 'status'}
            className='bg-surface border-border pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 pl-5 shadow-lg'
        >
            {/* Barra de color lateral según el tipo */}
            <span
                className={`absolute inset-y-0 left-0 w-1 ${bar}`}
                aria-hidden
            />

            <Icon className={iconColor} fontSize='small' />

            <div className='min-w-0 flex-1'>
                {alert.title && (
                    <p className='text-text text-sm font-semibold'>
                        {alert.title}
                    </p>
                )}
                <p className='text-text-60 text-sm wrap-break-word'>
                    {alert.message}
                </p>
            </div>

            <button
                type='button'
                onClick={() => removeAlert(alert.id)}
                aria-label='Cerrar alerta'
                className='text-text-38 hover:text-text -mt-1 -mr-1 flex size-6 shrink-0 items-center justify-center rounded-full transition-colors'
            >
                <CloseIcon sx={{ fontSize: 16 }} />
            </button>
        </motion.div>
    );
};

const Alerts = () => {
    const alerts = useAlertStore(state => state.alerts);

    return (
        <div className='pointer-events-none fixed top-16 right-4 z-100 flex w-[min(92vw,22rem)] flex-col gap-2'>
            <AnimatePresence initial={false}>
                {alerts.map(alert => (
                    <AlertItem key={alert.id} alert={alert} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Alerts;
