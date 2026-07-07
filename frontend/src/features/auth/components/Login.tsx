import { motion } from 'motion/react';

import { useAuth } from '../hooks/useAuth';
import { LoginFormSchema } from '../schemas/userSchema';
import { loginFields } from './authFields';
import AuthForm from './AuthForm';

type LoginProps = {
    showLogin: boolean;
};

const Login = ({ showLogin }: LoginProps) => {
    const { login } = useAuth();

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
            <AuthForm
                eyebrow='Bienvenido'
                title='Iniciar sesión'
                submitLabel='ENTRAR'
                schema={LoginFormSchema}
                defaultValues={{ email: '', password: '' }}
                onAuthenticate={login}
                successMessage='Sesión iniciada correctamente'
                fields={loginFields}
                footer={
                    <p className='text-primary hover:text-primary-hover mt-2 cursor-pointer text-right text-xs'>
                        ¿Olvidaste tu contraseña?
                    </p>
                }
            />
        </motion.div>
    );
};

export default Login;
