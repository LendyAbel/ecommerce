import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { useState } from 'react';

import { notify } from '@/shared/store/alertStore';
import { Button, Modal } from '@/shared/ui';
import { sxInputStyle } from '@/shared/utils/utils';

import { useUpdateStatusOrder } from '../hooks/useOrder';
import {
    type Order,
    type OrderStatus,
    orderStatusValues,
} from '../schemas/orderSchemas';
import { ORDER_STATUS_CONFIG } from '../utils/orderStatus';

interface OrderAdminStatusSelectProps {
    order: Order;
}

const OrderAdminStatusSelect = ({ order }: OrderAdminStatusSelectProps) => {
    const updateStatus = useUpdateStatusOrder();
    const [status, setStatus] = useState<OrderStatus | ''>(order?.status ?? '');
    const [confirmStatusChange, setConfirmStatusChange] = useState(false);

    const handleStatusChange = async () => {
        if (!order || status === '') return;
        await updateStatus.mutateAsync({ orderId: order.id, status });
        setConfirmStatusChange(false);
        notify.info('Status modificado');
    };

    const handleCancelChange = () => {
        setStatus(order.status);
        setConfirmStatusChange(false);
    };

    return (
        <FormControl size='small' sx={{ ...sxInputStyle, minWidth: 200 }}>
            <InputLabel id='select-label'>Estado</InputLabel>
            <Select
                labelId='select-label'
                label='Estado'
                variant='outlined'
                id='status'
                name='status'
                value={status as OrderStatus}
                onChange={(e: SelectChangeEvent<OrderStatus>) => {
                    setStatus(e.target.value as OrderStatus);
                    setConfirmStatusChange(true);
                }}
                MenuProps={{
                    PaperProps: {
                        sx: {
                            bgcolor: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            border: '1px solid var(--color-border)',
                            '& .MuiMenuItem-root:hover': {
                                bgcolor: 'var(--color-primary-10)',
                            },
                            '& .MuiMenuItem-root.Mui-selected': {
                                bgcolor: 'var(--color-primary-10)',
                                color: 'var(--color-primary)',
                            },
                        },
                    },
                }}
            >
                {orderStatusValues.map(status => (
                    <MenuItem key={status} value={status}>
                        {ORDER_STATUS_CONFIG[status].label}
                    </MenuItem>
                ))}
            </Select>
            <Modal
                open={confirmStatusChange}
                onClose={handleCancelChange}
                title='Modificar status'
            >
                <div className='px-6 pt-2 pb-6'>
                    <p className='text-text-60 text-sm'>
                        ¿Seguro que quieres modificar este pedido a {status}?
                    </p>
                    <div className='mt-6 flex justify-end gap-3'>
                        <Button variant='outline' onClick={handleCancelChange}>
                            Volver
                        </Button>
                        <Button
                            variant='danger'
                            loading={updateStatus.isPending}
                            onClick={handleStatusChange}
                        >
                            Aceptar cambio
                        </Button>
                    </div>
                </div>
            </Modal>
        </FormControl>
    );
};

export default OrderAdminStatusSelect;
