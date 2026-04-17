import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAuthStore } from '../../store/authStore';
import { useForm } from '@tanstack/react-form';
import { RegisterFormSchema } from '../../schemas/userSchema';
import { useNavigate } from 'react-router';
import TextFieldInput from '../common/TextFieldInput';

type RegisterProps = {
    showLogin: boolean;
};
const Register = ({ showLogin }: RegisterProps) => {
    const register = useAuthStore(state => state.register);
    const navigate = useNavigate();
    const { Field, handleSubmit } = useForm({
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
        validators: {
            onSubmit: RegisterFormSchema,
        },
        onSubmit: async ({ value }) => {
            console.log(value);
            await register(value);
            navigate('/products');
        },
    });

    const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('register');
        handleSubmit();
    };

    return (
        <div
            className='absolute top-0 right-0 flex h-full w-1/2 flex-col items-center justify-center px-10'
            style={{
                opacity: showLogin ? 0 : 1,
                transform: showLogin ? 'translateX(40px)' : 'translateX(0)',
                transition: 'opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s',
                pointerEvents: showLogin ? 'none' : 'auto',
            }}
        >
            <form onSubmit={onSubmit} className='w-full max-w-xs'>
                <p className='text-xs font-semibold tracking-[0.25em] text-purple-400 uppercase'>
                    Crear cuenta
                </p>
                <h2
                    className='mt-1 text-2xl font-bold text-white'
                    style={{ fontFamily: 'Georgia, serif' }}
                >
                    Registrarse
                </h2>

                <div className='mt-7 flex flex-col gap-4'>
                    <Field name={'name'}>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Name'
                                startIcon={
                                    <PersonOutlineIcon
                                        sx={{
                                            color: 'rgba(255,255,255,0.4)',
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
                                            color: 'rgba(255,255,255,0.4)',
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
                                label='Password'
                                type='password'
                                startIcon={
                                    <LockOutlinedIcon
                                        sx={{
                                            color: 'rgba(255,255,255,0.4)',
                                            fontSize: 18,
                                        }}
                                    />
                                }
                            />
                        )}
                    </Field>
                </div>

                <button
                    type={'submit'}
                    className='mt-6 w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95'
                    style={{
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    }}
                >
                    CREAR CUENTA
                </button>
            </form>
        </div>
    );
};

export default Register;
