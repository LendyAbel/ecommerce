import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { RegisterFormSchema } from '../../schemas/userSchema';
import { motion } from 'motion/react';
import { useAuth } from '../../hooks/auth/useAuth';
import AuthForm from './AuthForm';

type RegisterProps = {
    showLogin: boolean;
};

const iconSx = { color: 'var(--color-text-38)', fontSize: 18 };

const Register = ({ showLogin }: RegisterProps) => {
    const { register } = useAuth();

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
            <AuthForm
                eyebrow='Crear cuenta'
                title='Registrarse'
                submitLabel='CREAR CUENTA'
                submitClassName='mt-6'
                schema={RegisterFormSchema}
                defaultValues={{ name: '', email: '', password: '' }}
                onAuthenticate={register}
                fields={[
                    {
                        name: 'name',
                        label: 'Nombre',
                        icon: <PersonOutlineIcon sx={iconSx} />,
                    },
                    {
                        name: 'email',
                        label: 'Email',
                        type: 'email',
                        icon: <EmailOutlinedIcon sx={iconSx} />,
                    },
                    {
                        name: 'password',
                        label: 'Contraseña',
                        type: 'password',
                        icon: <LockOutlinedIcon sx={iconSx} />,
                    },
                ]}
            />
        </motion.div>
    );
};

export default Register;
