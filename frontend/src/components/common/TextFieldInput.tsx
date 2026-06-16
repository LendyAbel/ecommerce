import { IconButton, InputAdornment, TextField } from '@mui/material';
import type { AnyFieldApi } from '@tanstack/react-form';
import { useState, type JSX } from 'react';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { sxInputStyle } from '../../utils/utils';
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
                                    sx={{ color: 'var(--color-text-38)', fontSize: 18 }}
                                />
                            ) : (
                                <VisibilityOutlinedIcon
                                    sx={{ color: 'var(--color-text-38)', fontSize: 18 }}
                                />
                            )}
                        </IconButton>
                    )}
                </InputAdornment>
            ),
        },
    };

    const hasError = !isValid && isTouched;
    const errorId = `${field.name}-error`;

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
                slotProps={{
                    ...(startIcon && { input: inputSlotProps }),
                    htmlInput: {
                        'aria-invalid': hasError || undefined,
                        'aria-describedby': hasError ? errorId : undefined,
                    },
                }}
                sx={sxInputStyle}
            />
            {hasError && (
                <small id={errorId} className='text-error absolute top-2.5 right-4 font-bold'>
                    {errors[0]?.message}
                </small>
            )}
        </div>
    );
};

export default TextFieldInput;
