import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TextFieldInput from '../common/TextFieldInput';
import { useForm } from '@tanstack/react-form';
import { LoginFormSchema } from '../../schemas/userSchema';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';

type LoginProps = {
    showLogin: boolean;
};

const Login = ({ showLogin }: LoginProps) => {
    const login = useAuthStore(state => state.login);
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const { Field, handleSubmit, state } = useForm({
        defaultValues: { email: '', password: '' },
        validators: { onSubmit: LoginFormSchema },
        onSubmit: async ({ value }) => {
            setServerError(null);
            try {
                await login(value);
                navigate('/products');
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    setServerError(error.response?.data?.error ?? 'Credenciales incorrectas');
                } else {
                    setServerError('Error inesperado. Inténtalo de nuevo.');
                }
            }
        },
    });

    const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSubmit();
    };

    return (
        <motion.div
            className='absolute top-0 left-0 flex h-full w-1/2 flex-col items-center justify-center px-10'
            animate={{
                opacity: showLogin ? 1 : 0,
                x: showLogin ? 0 : -40,
                pointerEvents: showLogin ? 'auto' : 'none',
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
        >
            <form onSubmit={onSubmit} className='w-full max-w-xs'>
                <p className='text-xs font-semibold uppercase tracking-[0.25em] text-primary'>
                    Bienvenido
                </p>
                <h2 className='mt-1 font-display text-2xl font-bold text-text'>
                    Iniciar sesión
                </h2>

                <div className='mt-7 flex flex-col gap-4'>
                    <Field name='email'>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Email'
                                startIcon={
                                    <EmailOutlinedIcon sx={{ color: 'var(--color-text-38)', fontSize: 18 }} />
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
                                    <LockOutlinedIcon sx={{ color: 'var(--color-text-38)', fontSize: 18 }} />
                                }
                            />
                        )}
                    </Field>
                </div>

                <p className='mt-2 cursor-pointer text-right text-xs text-primary hover:text-primary-hover'>
                    ¿Olvidaste tu contraseña?
                </p>

                {serverError && (
                    <p className='mt-3 text-xs font-medium text-error'>{serverError}</p>
                )}

                <button
                    type='submit'
                    disabled={state.isSubmitting}
                    className='btn btn-primary btn-full mt-5'
                >
                    {state.isSubmitting && (
                        <svg className='size-4 animate-spin' viewBox='0 0 24 24' fill='none'>
                            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z' />
                        </svg>
                    )}
                    ENTRAR
                </button>
            </form>
        </motion.div>
    );
};

export default Login;
