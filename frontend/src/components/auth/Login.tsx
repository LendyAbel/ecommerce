import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TextFieldInput from '../common/TextFieldInput';
import { useForm } from '@tanstack/react-form';
import { LoginFormSchema } from '../../schemas/userSchema';

type LoginProps = {
    showLogin: boolean;
};

const Login = ({ showLogin }: LoginProps) => {
    const { Field, handleSubmit } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        validators: {
            onSubmit: LoginFormSchema,
        },
        onSubmit: async ({ value }) => {
            console.log(value);
        },
    });

    const onSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('submit');
        handleSubmit();
    };

    return (
        <div
            className={`absolute top-0 left-0 flex h-full w-1/2 flex-col items-center justify-center px-10 transition-all duration-400 ease-out ${showLogin ? 'translateX(0) auto opacity-100' : 'translateX(-40px) none opacity-0'}`}
        >
            <form onSubmit={onSubmit} className='w-full max-w-xs'>
                <p className='text-xs font-semibold tracking-[0.25em] text-purple-400 uppercase'>
                    Bienvenido
                </p>
                <h2 className='mt-1 font-[Georgia,serif] text-2xl font-bold text-white'>
                    Iniciar sesión
                </h2>

                <div className='mt-7 flex flex-col gap-4'>
                    <Field name={'email'}>
                        {field => (
                            <TextFieldInput
                                field={field}
                                label='Email'
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
                                label='Contraseña'
                                type={'password'}
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

                <p className='mt-2 cursor-pointer text-right text-xs text-purple-400 hover:text-purple-300'>
                    ¿Olvidaste tu contraseña?
                </p>

                <button
                    type={'submit'}
                    className='mt-5 w-full rounded-xl bg-linear-to-r from-[#667eea] to-[#764ba2] py-2.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95'
                >
                    ENTRAR
                </button>
            </form>
        </div>
    );
};

export default Login;
