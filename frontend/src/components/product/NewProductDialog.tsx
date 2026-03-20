import { Close } from '@mui/icons-material';
import { Button, Dialog, DialogTitle } from '@mui/material';
import type { NewProduct, NewProductForm } from '../../types/productTypes';

const formDefaultValues: NewProductForm = {
    name: '',
    brand: '',
    sku: '',
    price: 0,
    tax: 0,
    stock: 0,
    mainCategory: '',
    categories: [],
    images: [],
    shortDescription: '',
    longDescription: '',
};

type NewProductDialogProps = {
    isOpen: boolean;
    onClose: () => void;
};

const NewProductDialog = ({ isOpen, onClose }: NewProductDialogProps) => {
    const handleSubmit = () => {
        console.log('submit');
        onClose();
    };

    const handleCancel = () => {
        console.log('cancel');
        onClose();
    };

    return (
        <Dialog fullWidth open={isOpen} onClose={onClose} className='flex flex-col'>
            <DialogTitle className=' self-center'>NewProductDialog</DialogTitle>
            <Button
                sx={{ position: 'absolute', top: 10, right: 10 }}
                variant='text'
                onClick={onClose}
            >
                <Close />
            </Button>
        </Dialog>
    );
};

export default NewProductDialog;
