import { Close } from '@mui/icons-material';
import { Alert, Dialog } from '@mui/material';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import categoriesService from '../../services/categories.service';
import TextFieldInput from '../common/TextFieldInput';
import SingleSelectInput from '../common/SingleSelectInput';
import type { ProductForm } from '../../types/productTypes';
import MultipleSelectInput from '../common/MultipleSelecInput';
import ImagesInput from '../common/ImagesInput';
import { productFormSchema, productStatus } from '../../schemas/productZodSchema';
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
        validators: { onSubmit: productFormSchema },
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
            {/* Header */}
            <div className='relative px-6 pb-0 pt-6'>
                <p className='text-xs font-semibold uppercase tracking-[0.25em] text-primary'>
                    Administración
                </p>
                <h2 className='mt-1 font-display text-2xl font-bold text-text'>
                    Nuevo producto
                </h2>
                <button
                    type='button'
                    onClick={onClose}
                    className='absolute right-5 top-5 flex size-8 items-center justify-center rounded-full text-text-60 transition-colors duration-200 hover:bg-panel hover:text-text'
                >
                    <Close fontSize='small' />
                </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className='mb-6 mt-6 flex flex-col gap-2'>
                <div className='flex max-h-110 flex-col gap-4 overflow-auto px-6 py-2'>
                    <Field name='sku'>
                        {field => <TextFieldInput autofocus field={field} label='SKU' />}
                    </Field>
                    <Field name='name' validators={{ onBlur: z.string().min(3, 'Mínimo 3 caracteres') }}>
                        {field => <TextFieldInput field={field} label='Nombre' />}
                    </Field>
                    <Field name='brand'>
                        {field => <TextFieldInput field={field} label='Marca' />}
                    </Field>
                    <Field name='price'>
                        {field => <TextFieldInput field={field} label='Precio' type='number' />}
                    </Field>
                    <Field name='tax'>
                        {field => <TextFieldInput field={field} label='IVA (%)' type='number' />}
                    </Field>
                    <Field name='status'>
                        {field => (
                            <SingleSelectInput
                                field={field}
                                label='Estado'
                                options={productStatus}
                                addOption={false}
                            />
                        )}
                    </Field>
                    <Field name='shortDescription'>
                        {field => <TextFieldInput field={field} label='Descripción corta' />}
                    </Field>
                    <Field name='longDescription'>
                        {field => <TextFieldInput field={field} label='Descripción larga' />}
                    </Field>
                    <Field name='mainCategory'>
                        {field => (
                            <SingleSelectInput
                                field={field}
                                label='Categoría principal'
                                options={categories.map(cat => cat.name)}
                            />
                        )}
                    </Field>
                    <Field name='categories'>
                        {field => (
                            <MultipleSelectInput
                                field={field}
                                label='Otras categorías'
                                options={categories.map(cat => cat.name)}
                            />
                        )}
                    </Field>
                    <Field name='stock'>
                        {field => <TextFieldInput field={field} label='Stock' type='number' />}
                    </Field>
                    <Field name='images'>
                        {field => <ImagesInput field={field} />}
                    </Field>
                </div>

                {isError && (
                    <div className='mx-6'>
                        <Alert severity='error'>Error al guardar el producto</Alert>
                    </div>
                )}

                <div className='mt-2 flex justify-end gap-3 px-6'>
                    <button
                        type='button'
                        onClick={handleCancel}
                        className='btn btn-ghost rounded-xl border border-border px-6 py-2.5 text-sm'
                    >
                        Cancelar
                    </button>
                    <button
                        type='submit'
                        disabled={isPending}
                        className='btn btn-primary disabled:cursor-not-allowed disabled:opacity-60'
                    >
                        {isPending && (
                            <svg className='size-4 animate-spin' viewBox='0 0 24 24' fill='none'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z' />
                            </svg>
                        )}
                        {isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </form>
        </Dialog>
    );
};

export default NewProductDialog;
