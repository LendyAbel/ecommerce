import { useForm } from '@tanstack/react-form';
import { useState } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { UpdateProfileFormSchema } from '@/features/auth/schemas/userSchemas';
import { useAuthStore } from '@/features/auth/store/authStore';
import { ApiError } from '@/lib/api/client';
import { notify } from '@/shared/store/alertStore';
import { Button, Card } from '@/shared/ui';
import TextFieldInput from '@/shared/ui/TextFieldInput';

/**
 * Formulario para editar nombre y email de la cuenta. Vive en su propia
 * tarjeta dentro de la página "Mis datos".
 */
const ProfileForm = () => {
    const user = useAuthStore(state => state.user);
    const { updateProfile } = useAuth();
    const [serverError, setServerError] = useState<string | null>(null);

    const { Field, handleSubmit, state } = useForm({
        defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
        validators: {
            onSubmit: UpdateProfileFormSchema,
            onBlur: UpdateProfileFormSchema,
        },
        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                await updateProfile(value);
                notify.success('Datos actualizados');
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
                Datos personales
            </h2>
            <p className='text-text-60 mt-1 text-sm'>
                Actualiza tu nombre y correo electrónico.
            </p>

            <form onSubmit={onSubmit} className='mt-6 flex flex-col gap-4'>
                <Field name='name'>
                    {field => (
                        <TextFieldInput field={field} label='Nombre' autofocus />
                    )}
                </Field>
                <Field name='email'>
                    {field => (
                        <TextFieldInput field={field} label='Email' type='email' />
                    )}
                </Field>

                {serverError && (
                    <p className='text-error text-xs font-medium'>{serverError}</p>
                )}

                <div className='mt-2 flex justify-end'>
                    <Button type='submit' loading={state.isSubmitting}>
                        Guardar cambios
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default ProfileForm;
