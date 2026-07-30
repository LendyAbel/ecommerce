import { type ReactNode } from 'react';

import { Button, Modal } from '@/shared/ui';
import type { ButtonVariant } from '@/shared/ui/Button';

interface ConfirmDialogProps {
    open: boolean;
    title?: string;

    message?: string | ReactNode;
    confirmLabel?: string;
    variant?: ButtonVariant;
    loading: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

const ConfirmDialog = ({
    open,
    title,
    message,
    confirmLabel,
    variant = 'danger',
    loading,
    onConfirm,
    onClose,
}: ConfirmDialogProps) => {
    return (
        <Modal open={open} onClose={onClose} title={title}>
            <div className='px-6 pt-2 pb-6'>
                {typeof message === 'string' ? (
                    <p className='text-text-60 text-sm'>{message}</p>
                ) : (
                    message
                )}
                <div className='mt-6 flex justify-end gap-3'>
                    <Button variant='outline' onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        variant={variant}
                        loading={loading}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
