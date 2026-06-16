import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useForm } from '@tanstack/react-form';
import { RegisterFormSchema } from '../../schemas/userSchema';
import { useNavigate } from 'react-router';
import TextFieldInput from '../common/TextFieldInput';
import { useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/auth/useAuth';

type RegisterProps = {
    showLogin: boolean;
};

const Register = ({ showLogin }: RegisterProps) => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const { Field, handleSubmit, state } = useForm({
        defaultValues: { name: '', email: '', password: '' },
        validators: { onSubmit: RegisterFormSchema },
        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                await register(value);
                navigate('/products');
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
        <motion.div
            className='absolute top-0 right-0 flex h-full w-1/2 flex-col items-center justify-center px-10'
            animate={{
                opacity: showLogin ? 0 : 1,
                x: showLogin ? 40 : 0,
                pointerEvents: showLogin ? 'none' : 'auto',
            }}
            transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: showLogin ? 0 : 0.2,
            }}
        >
            <form onSubmit={onSubmit} className='w-full max-w-xs'>
                <p className='text-primary text-xs font-semibold tracking-[0.25em] uppercase'>
                    Crear cuenta
                </p>
                <h2 className='font-display text-text mt-1 text-2xl font-bold'>
                    Registrarse
                </h2>

                <div className='mt-7 flex flex-col gap-4'>
                    <Field name='name'>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Nombre'
                                startIcon={
                                    <PersonOutlineIcon
                                        sx={{
                                            color: 'var(--color-text-38)',
                                            fontSize: 18,
                                        }}
                                    />
                                }
                            />
                        )}
                    </Field>
                    <Field name='email'>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Email'
                                type='email'
                                startIcon={
                                    <EmailOutlinedIcon
                                        sx={{
                                            color: 'var(--color-text-38)',
                                            fontSize: 18,
                                        }}
                                    />
                                }
                            />
                        )}
                    </Field>
                    <Field name='password'>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Contraseña'
                                type='password'
                                startIcon={
                                    <LockOutlinedIcon
                                        sx={{
                                            color: 'var(--color-text-38)',
                                            fontSize: 18,
                                        }}
                                    />
                                }
                            />
                        )}
                    </Field>
                </div>

                {serverError && (
                    <p className='text-error mt-3 text-xs font-medium'>
                        {serverError}
                    </p>
                )}

                <button
                    type='submit'
                    disabled={state.isSubmitting}
                    className='btn btn-primary btn-full mt-6'
                >
                    {state.isSubmitting && (
                        <svg
                            className='size-4 animate-spin'
                            viewBox='0 0 24 24'
                            fill='none'
                        >
                            <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'
                            />
                            <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                            />
                        </svg>
                    )}
                    CREAR CUENTA
                </button>
            </form>
        </motion.div>
    );
};

export default Register;
