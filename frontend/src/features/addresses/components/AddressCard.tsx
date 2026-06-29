import { memo } from 'react';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Button, Card } from '@/shared/ui';
import type { Address } from '../schemas/addressSchemas';

type AddressCardProps = {
    address: Address;
    onEdit: (address: Address) => void;
    onDelete: (address: Address) => void;
};

/**
 * Tarjeta de una dirección de la libreta del usuario. Solo renderiza los campos
 * opcionales que existan y expone las acciones de editar y eliminar.
 */
const AddressCard = ({ address, onEdit, onDelete }: AddressCardProps) => (
    <Card padded className='flex flex-col gap-1'>
        <p className='text-text font-semibold'>{address.fullName}</p>
        <address className='text-text-60 text-sm not-italic'>
            {address.line1}
            {address.line2 && <>, {address.line2}</>}
            <br />
            {address.postalCode} {address.city}
            {address.state && <>, {address.state}</>}
            <br />
            {address.country}
        </address>
        {address.phone && (
            <p className='text-text-60 mt-1 text-sm'>Tel. {address.phone}</p>
        )}

        <div className='border-border mt-4 flex gap-2 border-t pt-4'>
            <Button
                size='sm'
                variant='outline'
                leftIcon={<EditOutlinedIcon fontSize='small' />}
                onClick={() => onEdit(address)}
            >
                Editar
            </Button>
            <Button
                size='sm'
                variant='ghost'
                leftIcon={<DeleteOutlineIcon fontSize='small' />}
                onClick={() => onDelete(address)}
            >
                Eliminar
            </Button>
        </div>
    </Card>
);

export default memo(AddressCard);
