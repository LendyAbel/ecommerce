import { Close } from '@mui/icons-material';
import { Alert, Button, Dialog, DialogTitle } from '@mui/material';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import categoriesService from '../../services/categories.service';
import TextFieldInput from '../common/TextFieldInput';
import SingleSelectInput from '../common/SingleSelectInput';
import type { ProductForm } from '../../types/productTypes';
import MultipleSelectInput from '../common/MultipleSelecInput';
import ImagesInput from '../common/ImagesInput';
import {
    productFormSchema,
    productStatus,
} from '../../schemas/productZodSchema';
import z from 'zod';
import useAddNewProduct from '../../hooks/product/useAddNewProduct';

const formDefaultValues: ProductForm = {
    name: '',
    brand: '',
    sku: '',
    price: 0,
    tax: 21,
    stock: undefined,
    mainCategory: '',
    categories: [],
    images: [],
    shortDescription: '',
    longDescription: '',
    status: 'draft',
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

    const { addNewProduct, isPending, isError } = useAddNewProduct();

    const { Field, reset, handleSubmit } = useForm({
        defaultValues: formDefaultValues,
        validators: {
            onSubmit: productFormSchema,
        },
        onSubmit: async ({ value }) => {
            await addNewProduct(value);
            onClose();
            reset();
        },
    });

    const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSubmit();
    };

    const handleCancel = () => {
        reset();
        onClose();
    };

    return (
        <Dialog
            fullWidth
            open={isOpen}
            onClose={onClose}
            className='relative flex flex-col'
            slotProps={{
                paper: {
                    sx: {
                        background:
                            'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
                            borderRadius: '24px'
                    },
                },
            }}
        >
            <DialogTitle className='self-center text-white font-bold'>ADD NEW PRODUCT</DialogTitle>

            {/* -------------FORM--------------- */}
            <form onSubmit={onSubmit} className='mt-7 mb-7 flex flex-col gap-2'>
                <div className='flex max-h-110 flex-col gap-4 overflow-auto p-2 m-2'>
                    {/*------OBLIGATORY FIELDS------ */}
                    <Field name={'sku'}>
                        {field => (
                            <TextFieldInput
                                autofocus={true}
                                field={field}
                                label='Sku'
                            />
                        )}
                    </Field>
                    <Field
                        name={'name'}
                        validators={{ onBlur: z.string().min(3, 'Too short') }}
                    >
                        {field => <TextFieldInput field={field} label='Name' />}
                    </Field>
                    <Field name={'brand'}>
                        {field => (
                            <TextFieldInput field={field} label='Brand' />
                        )}
                    </Field>
                    <Field name={'price'}>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Price'
                                type='number'
                            />
                        )}
                    </Field>
                    <Field name={'tax'}>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Tax'
                                type='number'
                            />
                        )}
                    </Field>
                    <Field name='status'>
                        {field => (
                            <SingleSelectInput
                                field={field}
                                label='Status'
                                options={productStatus}
                                addOption={false}
                            />
                        )}
                    </Field>
                    <Field name={'shortDescription'}>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Short Description'
                            />
                        )}
                    </Field>

                    {/*------OPTIONAL FIELDS------ */}

                    <Field name={'longDescription'}>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Long Description'
                            />
                        )}
                    </Field>
                    <Field name={'mainCategory'}>
                        {field => (
                            <SingleSelectInput
                                field={field}
                                label='Main Category'
                                options={categories.map(cat => cat.name)}
                            />
                        )}
                    </Field>
                    <Field name={'categories'}>
                        {field => (
                            <MultipleSelectInput
                                field={field}
                                label='Other Categories'
                                options={categories.map(cat => cat.name)}
                            />
                        )}
                    </Field>
                    <Field name={'stock'}>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Stock'
                                type='number'
                            />
                        )}
                    </Field>

                    <Field name={'images'}>
                        {field => <ImagesInput field={field} />}
                    </Field>
                </div>

                {/* ------DISPLAY ERROR------*/}
                {isError && (
                    <Alert severity='error'>Error submitting form</Alert>
                )}

                {/* ------ACTIONS BUTTOMS--------- */}
                <div className='flex justify-around'>
                    <Button
                        type={'submit'}
                        variant={'contained'}
                        disabled={isPending}
                    >
                        {isPending ? 'Submitting...' : 'Submit'}
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
                sx={{ position: 'absolute', top: 10, right: 10, color: 'white' }}
                variant='text'
                onClick={onClose}
            >
                <Close />
            </Button>
        </Dialog>
    );
};

export default NewProductDialog;
