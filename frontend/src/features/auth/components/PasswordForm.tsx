import { useForm } from '@tanstack/react-form';
import { useState } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ChangePasswordFormSchema } from '@/features/auth/schemas/userSchemas';
import { ApiError } from '@/lib/api/client';
import { notify } from '@/shared/store/alertStore';
import { Button, Card } from '@/shared/ui';
import TextFieldInput from '@/shared/ui/TextFieldInput';

const emptyValues = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
};

/**
 * Formulario para cambiar la contraseña de la cuenta. Vive en su propia
 * tarjeta dentro de la página "Mis datos".
 */
const PasswordForm = () => {
    const { changePassword } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

    const { Field, handleSubmit, state, reset } = useForm({
        defaultValues: emptyValues,
        validators: {
            onSubmit: ChangePasswordFormSchema,
        },
        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                await changePassword({
                    currentPassword: value.currentPassword,
                    newPassword: value.newPassword,
                });
                notify.success('Contraseña actualizada');
                reset();
            } catch (error) {
                setServerError(
                    error instanceof ApiError
                        ? error.message
                        : 'Error inesperado. Inténtalo de nuevo.',
                );
            }
        },
    });

    const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSubmit();
    };

    return (
        <Card padded>
            <h2 className='font-display text-text text-lg font-bold'>
                Contraseña
            </h2>
            <p className='text-text-60 mt-1 text-sm'>
                Cambia la contraseña de acceso a tu cuenta.
            </p>

            <form onSubmit={onSubmit} className='mt-6 flex flex-col gap-4'>
                <Field name='currentPassword'>
                    {field => (
                        <TextFieldInput
                            field={field}
                            label='Contraseña actual'
                            type='password'
                        />
                    )}
                </Field>
                <Field name='newPassword'>
                    {field => (
                        <TextFieldInput
                            field={field}
                            label='Nueva contraseña'
                            type='password'
                        />
                    )}
                </Field>
                <Field name='confirmNewPassword'>
                    {field => (
                        <TextFieldInput
                            field={field}
                            label='Confirmar nueva contraseña'
                            type='password'
                        />
                    )}
                </Field>

                {serverError && (
                    <p className='text-error text-xs font-medium'>{serverError}</p>
                )}

                <div className='mt-2 flex justify-end'>
                    <Button type='submit' loading={state.isSubmitting}>
                        Cambiar contraseña
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default PasswordForm;
