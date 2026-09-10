import { useForm } from '@tanstack/react-form';
import type { JSX, ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { ZodType } from 'zod';

import { ApiError } from '@/lib/api/client';
import { notify } from '@/shared/store/alertStore';
import { Button } from '@/shared/ui';
import TextFieldInput from '@/shared/ui/TextFieldInput';

export type AuthFieldConfig<TValues> = {
    name: Extract<keyof TValues, string>;
    label: string;
    type?: 'text' | 'email' | 'password';
    icon: JSX.Element;
};

type AuthFormProps<TValues extends Record<string, string>> = {
    eyebrow: string;
    title: string;
    submitLabel: string;
    fields: AuthFieldConfig<TValues>[];
    schema: ZodType<TValues, TValues>;
    defaultValues: TValues;
    /** Acción de autenticación (login/register). Recibe los valores del form. */
    onAuthenticate: (values: TValues) => Promise<unknown>;
    /** Mensaje mostrado tras autenticar con éxito (varía entre login/registro). */
    successMessage: string;
    /** Contenido opcional entre los campos y el botón (ej. enlace de ayuda). */
    footer?: ReactNode;
    /** Margen superior del botón de envío (varía ligeramente entre formularios). */
    submitClassName?: string;
};

function AuthForm<TValues extends Record<string, string>>({
    eyebrow,
    title,
    submitLabel,
    fields,
    schema,
    defaultValues,
    onAuthenticate,
    successMessage,
    footer,
    submitClassName = 'mt-5',
}: AuthFormProps<TValues>) {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const { Field, handleSubmit, state } = useForm({
        defaultValues,
        validators: { onSubmit: schema },
        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                await onAuthenticate(value);
                notify.success(successMessage);
                navigate('/products');
            } catch (error) {
                setServerError(
                    error instanceof ApiError
                        ? error.message
                        : 'Error inesperado. Inténtalo de nuevo.',
                );

                if (error instanceof ApiError) {
                    console.log('ERROR!!! ', error.message);
                }
            }
        },
    });

    const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSubmit();
    };

    return (
        <form onSubmit={onSubmit} className='w-full max-w-xs'>
            <p className='text-primary text-xs font-semibold tracking-[0.25em] uppercase'>
                {eyebrow}
            </p>
            <h2 className='font-display text-text mt-1 text-2xl font-bold'>
                {title}
            </h2>

            <div className='mt-7 flex flex-col gap-4'>
                {fields.map(f => (
                    <Field key={f.name} name={f.name}>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label={f.label}
                                type={f.type}
                                startIcon={f.icon}
                            />
                        )}
                    </Field>
                ))}
            </div>

            {footer}

            {serverError && (
                <p className='text-error mt-3 text-xs font-medium'>
                    {serverError}
                </p>
            )}

            <Button
                type='submit'
                fullWidth
                loading={state.isSubmitting}
                className={submitClassName}
            >
                {submitLabel}
            </Button>
        </form>
    );
}

export default AuthForm;
