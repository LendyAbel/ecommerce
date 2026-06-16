import { Alert } from '@mui/material';
import { useForm } from '@tanstack/react-form';
import TextFieldInput from '../common/TextFieldInput';
import SingleSelectInput from '../common/SingleSelectInput';
import type { ProductForm } from '../../types/productTypes';
import MultipleSelectInput from '../common/MultipleSelectInput';
import ImagesInput from '../common/ImagesInput';
import { productFormSchema, productStatus } from '../../schemas/productZodSchema';
import z from 'zod';
import useAddNewProduct from '../../hooks/product/useAddNewProduct';
import useCategory from '../../hooks/category/useCategory';
import { Button, Modal } from '@/shared/ui';

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
    const { categories } = useCategory();

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
        <Modal
            open={isOpen}
            onClose={onClose}
            eyebrow='Administración'
            title='Nuevo producto'
        >
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
                    <Button
                        variant='ghost'
                        onClick={handleCancel}
                        className='rounded-xl border border-border px-6 py-2.5 text-sm'
                    >
                        Cancelar
                    </Button>
                    <Button type='submit' loading={isPending}>
                        {isPending ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default NewProductDialog;
