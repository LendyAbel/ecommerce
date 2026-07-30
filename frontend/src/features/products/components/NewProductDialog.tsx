import { useForm } from '@tanstack/react-form';
import { useState } from 'react';

import { useCategories } from '@/features/categories/hooks/useCategory';
import { useCreateProduct } from '@/features/products/hooks/useProduct';
import {
    type ProductForm,
    ProductFormSchema,
    productStatus,
} from '@/features/products/schemas/productSchemas';
import { ApiError } from '@/lib/api/client';
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
    const { categories } = useCategories();

    const { createProduct, isPending } = useCreateProduct();
    const [serverError, setServerError] = useState<string | null>(null);

    const { Field, reset, handleSubmit } = useForm({
        defaultValues: formDefaultValues,
        validators: { onBlur: ProductFormSchema, onSubmit: ProductFormSchema },
        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                await createProduct(value);
                onClose();
                reset();
                notify.success('Producto añadido correctamente');
            } catch (error) {
                setServerError(
                    error instanceof ApiError
                        ? error.message
                        : 'Error al guardar el producto. Inténtalo de nuevo.',
                );
            }
        },
    });

    const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSubmit();
    };

    const handleCancel = () => {
        reset();
        setServerError(null);
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

                {serverError && (
                    <p className='text-error mx-6 text-xs font-medium'>
                        {serverError}
                    </p>
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
