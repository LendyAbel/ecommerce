import { useState } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoginFormSchema, RegisterFormSchema } from '@/features/auth/schemas/userSchema';

import { loginFields, registerFields } from './authFields';
import AuthForm from './AuthForm';

/**
 * Variante apilada del formulario de autenticación para móvil: una sola tarjeta
 * con un toggle Iniciar sesión / Registrarse.
 */
const AuthMobile = () => {
    const [showLogin, setShowLogin] = useState(true);
    const { login, register } = useAuth();

    const tabClass = (active: boolean) =>
        `flex-1 rounded-lg py-2 text-sm font-semibold transition-colors duration-200 ${
            active ? 'bg-primary text-white' : 'text-text-60 hover:text-text'
        }`;

    return (
        <div className='border-border bg-surface w-full max-w-sm rounded-2xl border p-6 shadow-xl'>
            <div className='mb-6 flex gap-2'>
                <button
                    type='button'
                    onClick={() => setShowLogin(true)}
                    className={tabClass(showLogin)}
                >
                    Iniciar sesión
                </button>
                <button
                    type='button'
                    onClick={() => setShowLogin(false)}
                    className={tabClass(!showLogin)}
                >
                    Registrarse
                </button>
            </div>

            {showLogin ? (
                <AuthForm
                    eyebrow='Bienvenido'
                    title='Iniciar sesión'
                    submitLabel='ENTRAR'
                    schema={LoginFormSchema}
                    defaultValues={{ email: '', password: '' }}
                    onAuthenticate={login}
                    successMessage='Sesión iniciada correctamente'
                    fields={loginFields}
                />
            ) : (
                <AuthForm
                    eyebrow='Crear cuenta'
                    title='Registrarse'
                    submitLabel='CREAR CUENTA'
                    schema={RegisterFormSchema}
                    defaultValues={{ name: '', email: '', password: '' }}
                    onAuthenticate={register}
                    successMessage='Cuenta creada correctamente'
                    fields={registerFields}
                />
            )}
        </div>
    );
};

export default AuthMobile;
