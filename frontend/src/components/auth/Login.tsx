import { useState } from 'react';

import { IconButton, InputAdornment, TextField } from '@mui/material';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

const inputSx = {
    '& .MuiOutlinedInput-root': {
        color: 'white',
        borderRadius: '10px',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
        '&.Mui-focused fieldset': { borderColor: '#667eea' },
        background: 'rgba(255,255,255,0.05)',
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.45)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },
};

type LoginProps = {
    isLogin: boolean;
};

const Login = ({ isLogin }: LoginProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div
            className='absolute top-0 left-0 flex h-full w-1/2 flex-col items-center justify-center px-10'
            style={{
                opacity: isLogin ? 1 : 0,
                transform: isLogin ? 'translateX(0)' : 'translateX(-40px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                pointerEvents: isLogin ? 'auto' : 'none',
            }}
        >
            <div className='w-full max-w-xs'>
                <p className='text-xs font-semibold tracking-[0.25em] text-purple-400 uppercase'>
                    Bienvenido
                </p>
                <h2
                    className='mt-1 text-2xl font-bold text-white'
                    style={{ fontFamily: 'Georgia, serif' }}
                >
                    Iniciar sesión
                </h2>

                <div className='mt-7 flex flex-col gap-4'>
                    <TextField
                        fullWidth
                        label='Email'
                        variant='outlined'
                        size='small'
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <EmailOutlinedIcon
                                            sx={{
                                                color: 'rgba(255,255,255,0.4)',
                                                fontSize: 18,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={inputSx}
                    />
                    <TextField
                        fullWidth
                        label='Contraseña'
                        variant='outlined'
                        size='small'
                        type={showPassword ? 'text' : 'password'}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <LockOutlinedIcon
                                            sx={{
                                                color: 'rgba(255,255,255,0.4)',
                                                fontSize: 18,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton
                                            onClick={() =>
                                                setShowPassword(p => !p)
                                            }
                                            edge='end'
                                            size='small'
                                        >
                                            {showPassword ? (
                                                <VisibilityOffOutlinedIcon
                                                    sx={{
                                                        color: 'rgba(255,255,255,0.4)',
                                                        fontSize: 18,
                                                    }}
                                                />
                                            ) : (
                                                <VisibilityOutlinedIcon
                                                    sx={{
                                                        color: 'rgba(255,255,255,0.4)',
                                                        fontSize: 18,
                                                    }}
                                                />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={inputSx}
                    />
                </div>

                <p className='mt-2 cursor-pointer text-right text-xs text-purple-400 hover:text-purple-300'>
                    ¿Olvidaste tu contraseña?
                </p>

                <button
                    className='mt-5 w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95'
                    style={{
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    }}
                >
                    ENTRAR
                </button>
            </div>
        </div>
    );
};

export default Login;
