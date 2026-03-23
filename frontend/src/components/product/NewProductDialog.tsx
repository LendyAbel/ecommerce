import { Close } from '@mui/icons-material';
import { Button, Dialog, DialogTitle } from '@mui/material';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import categoriesService from '../../services/categories.service';
import TextFieldInput from '../common/TextFieldInput';
import SingleSelectInput from '../common/SingleSelectInput';
import type { ProductForm } from '../../types/productTypes';
import MultipleSelectInput from '../common/MultipleSelecInput';

const formDefaultValues: ProductForm = {
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
    const { data } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesService.getCategories,
    });
    const categories = data ?? [];

    const form = useForm({
        defaultValues: formDefaultValues,
        onSubmit: async ({ value }) => {
            console.log(value);
            onClose();
        },
    });

    const handleSubmit = async (
        event: React.SyntheticEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        await form.handleSubmit();
        form.reset();
    };

    const handleCancel = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog
            fullWidth
            open={isOpen}
            onClose={onClose}
            className='flex flex-col'
        >
            <DialogTitle className='self-center'>NewProductDialog</DialogTitle>

            {/* -------------FORM--------------- */}
            <form onSubmit={handleSubmit} className='m-2 flex flex-col gap-2'>
                <form.Field
                    name={'name'}
                    children={field => (
                        <TextFieldInput field={field} label='Name' />
                    )}
                />

                <form.Field
                    name={'mainCategory'}
                    children={field => (
                        <SingleSelectInput
                            field={field}
                            label='Main Category'
                            options={categories.map(cat => cat.name)}
                        />
                    )}
                />
                <form.Field
                    name={'categories'}
                    children={field => (
                        <MultipleSelectInput
                            field={field}
                            label='Other Categories'
                            options={categories.map(cat => cat.name)}
                        />
                    )}
                />

                {/* ------actions buttons--------- */}
                <div className='flex justify-around'>
                    <Button type={'submit'} variant={'contained'}>
                        Submit
                    </Button>
                    <Button
                        type={'reset'}
                        variant={'contained'}
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </form>

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
