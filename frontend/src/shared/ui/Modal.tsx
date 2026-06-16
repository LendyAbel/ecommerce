import type { ReactNode } from 'react';
import { Dialog } from '@mui/material';
import { Close } from '@mui/icons-material';

type ModalProps = {
    open: boolean;
    onClose: () => void;
    /** Título principal del modal. */
    title?: string;
    /** Pequeña etiqueta superior en mayúsculas (ej. "Administración"). */
    eyebrow?: string;
    fullWidth?: boolean;
    children: ReactNode;
};

/**
 * Diálogo modal de la app. Envuelve el `Dialog` de MUI aplicando el estilo de
 * superficie del design system y, si se pasa `title`/`eyebrow`, una cabecera con
 * botón de cierre accesible. El contenido va como `children`.
 */
const Modal = ({
    open,
    onClose,
    title,
    eyebrow,
    fullWidth = true,
    children,
}: ModalProps) => {
    return (
        <Dialog
            fullWidth={fullWidth}
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-xl)',
                    },
                },
            }}
        >
            {(title || eyebrow) && (
                <div className='relative px-6 pb-0 pt-6'>
                    {eyebrow && (
                        <p className='text-primary text-xs font-semibold uppercase tracking-[0.25em]'>
                            {eyebrow}
                        </p>
                    )}
                    {title && (
                        <h2 className='font-display text-text mt-1 text-2xl font-bold'>
                            {title}
                        </h2>
                    )}
                    <button
                        type='button'
                        onClick={onClose}
                        aria-label='Cerrar'
                        className='text-text-60 hover:bg-panel hover:text-text absolute right-5 top-5 flex size-8 items-center justify-center rounded-full transition-colors duration-200'
                    >
                        <Close fontSize='small' />
                    </button>
                </div>
            )}
            {children}
        </Dialog>
    );
};

export default Modal;
