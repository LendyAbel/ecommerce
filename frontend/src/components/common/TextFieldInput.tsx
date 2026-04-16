import { IconButton, InputAdornment, TextField } from '@mui/material';
import type { AnyFieldApi } from '@tanstack/react-form';
import { useState, type JSX } from 'react';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
type TextFieldInputProps = {
    field: AnyFieldApi;
    label: string;
    type?: 'text' | 'number' | 'email' | 'password';
    autofocus?: boolean;
    startIcon?: JSX.Element;
};

const TextFieldInput = ({
    field,
    label,
    type = 'text',
    autofocus = false,
    startIcon,
}: TextFieldInputProps) => {
    const { errors, isValid, isTouched } = field.state.meta;

    const [showPassword, setShowPassword] = useState(false);

    const inputSlotProps = {
        ...(startIcon && {
            startAdornment: (
                <InputAdornment position='start'>{startIcon}</InputAdornment>
            ),
        }),
        ...{
            endAdornment: (
                <InputAdornment position='end'>
                    {type === 'password' && (
                        <IconButton
                            onClick={() => setShowPassword(p => !p)}
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
                    )}
                </InputAdornment>
            ),
        },
    };

    const hasAdornments = startIcon;

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
        '& input[type=number]': {
            MozAppearance: 'textfield', // Firefox
        },
        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
            {
                WebkitAppearance: 'none', // Chrome, Safari, Edge
                margin: 0,
            },
    };

    return (
        <div className='relative flex flex-col'>
            <TextField
                fullWidth
                label={label}
                variant='outlined'
                size='small'
                autoFocus={autofocus}
                multiline={type === 'text'}
                maxRows={3}
                type={
                    type === 'password'
                        ? showPassword
                            ? 'text'
                            : 'password'
                        : type
                }
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={e =>
                    field.handleChange(
                        type === 'number'
                            ? Number(e.target.value)
                            : e.target.value,
                    )
                }
                onBlur={field.handleBlur}
                onFocus={e => e.target.select()}
                slotProps={
                    hasAdornments ? { input: inputSlotProps } : undefined
                }
                sx={inputSx}
            />
            {!isValid && isTouched && (
                <small className='absolute top-2.5 right-4 font-bold text-red-500'>
                    {errors[0]?.message}
                </small>
            )}
        </div>
    );
};

export default TextFieldInput;
