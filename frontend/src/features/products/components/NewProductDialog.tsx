import { Alert } from '@mui/material';
import { useForm } from '@tanstack/react-form';

import useCategory from '@/features/categories/hooks/useCategory';
import useAddNewProduct from '@/features/products/hooks/useAddNewProduct';
import {
    productFormSchema,
    productStatus,
} from '@/features/products/schemas/productZodSchema';
import type { ProductForm } from '@/features/products/types/productTypes';
import { notify } from '@/shared/store/alertStore';
import { Button, Modal } from '@/shared/ui';
import ImagesInput from '@/shared/ui/ImagesInput';
import MultipleSelectInput from '@/shared/ui/MultipleSelectInput';
import SingleSelectInput from '@/shared/ui/SingleSelectInput';
import TextFieldInput from '@/shared/ui/TextFieldInput';

const formDefaultValues: ProductForm = {
    name: '',
    brand: '',
    sku: '',
    // Arranca vacío (no 0) para que el campo no muestre un precio por defecto.
    price: undefined as unknown as number,
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
        validators: { onBlur: productFormSchema, onSubmit: productFormSchema },
        onSubmit: async ({ value }) => {
            await addNewProduct(value);
            onClose();
            reset();
            notify.success('Producto añadido correctamente');
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
            <form onSubmit={onSubmit} className='mt-6 mb-6 flex flex-col gap-2'>
                <div className='flex max-h-110 flex-col gap-4 overflow-auto px-6 py-2'>
                    <Field name='sku'>
                        {field => (
                            <TextFieldInput
                                autofocus
                                field={field}
                                label='SKU'
                            />
                        )}
                    </Field>
                    <Field name='name'>
                        {field => (
                            <TextFieldInput field={field} label='Nombre' />
                        )}
                    </Field>
                    <Field name='brand'>
                        {field => (
                            <TextFieldInput field={field} label='Marca' />
                        )}
                    </Field>
                    <Field name='price'>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Precio'
                                type='number'
                            />
                        )}
                    </Field>
                    <Field name='tax'>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='IVA (%)'
                                type='number'
                            />
                        )}
                    </Field>
                    <Field name='status'>
                        {field => (
                            <SingleSelectInput
                                field={field}
                                label='Estado'
                                options={[...productStatus]}
                                addOption={false}
                            />
                        )}
                    </Field>
                    <Field name='shortDescription'>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Descripción corta'
                                multiline
                            />
                        )}
                    </Field>
                    <Field name='longDescription'>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Descripción larga'
                                multiline
                                maxRows={5}
                            />
                        )}
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
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Stock'
                                type='number'
                            />
                        )}
                    </Field>
                    <Field name='images'>
                        {field => <ImagesInput field={field} />}
                    </Field>
                </div>

                {isError && (
                    <div className='mx-6'>
                        <Alert severity='error'>
                            Error al guardar el producto
                        </Alert>
                    </div>
                )}

                <div className='mt-2 flex justify-end gap-3 px-6'>
                    <Button variant='outline' onClick={handleCancel}>
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
