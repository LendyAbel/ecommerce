import { IconButton, InputAdornment, TextField } from '@mui/material';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useState } from 'react';
import { sxInputStyle } from '../../utils/utils';



type RegisterProps = {
    showLogin: boolean;
};
const Register = ({ showLogin }: RegisterProps) => {
    const [showPassword, setShowPassword] = useState(false);

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
            <div className='w-full max-w-xs'>
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
                    <TextField
                        fullWidth
                        label='Nombre'
                        variant='outlined'
                        size='small'
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position='start'>
                                        <PersonOutlineIcon
                                            sx={{
                                                color: 'rgba(255,255,255,0.4)',
                                                fontSize: 18,
                                            }}
                                        />
                                    </InputAdornment>
                                ),
                            },
                        }}
                        sx={sxInputStyle}
                    />
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
                        sx={sxInputStyle}
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
                        sx={sxInputStyle}
                    />
                </div>

                <button
                    className='mt-6 w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95'
                    style={{
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    }}
                >
                    CREAR CUENTA
                </button>
            </div>
        </div>
    );
};

export default Register;
