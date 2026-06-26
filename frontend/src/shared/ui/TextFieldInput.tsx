import { IconButton, InputAdornment, TextField } from '@mui/material';
import type { AnyFieldApi } from '@tanstack/react-form';
import { useState, type JSX } from 'react';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { sxInputStyle } from '@/shared/utils/utils';
type TextFieldInputProps = {
    field: AnyFieldApi;
    label: string;
    type?: 'text' | 'number' | 'email' | 'password';
    autofocus?: boolean;
    startIcon?: JSX.Element;
    /** Permite que el campo crezca en varias líneas (ej. descripciones). */
    multiline?: boolean;
    /** Máximo de filas visibles cuando `multiline` está activo. */
    maxRows?: number;
};

// Convierte el texto del input a número (admite coma o punto). Vacío => undefined.
const parseNumber = (raw: string): number | undefined => {
    const normalized = raw.replace(',', '.');
    if (normalized === '' || normalized === '.') return undefined;
    const num = Number(normalized);
    return Number.isNaN(num) ? undefined : num;
};

// Deja solo dígitos y un único separador decimal.
const sanitizeNumber = (raw: string): string => {
    const cleaned = raw.replace(/[^\d.,]/g, '').replace(/,/g, '.');
    const firstDot = cleaned.indexOf('.');
    if (firstDot === -1) return cleaned;
    return (
        cleaned.slice(0, firstDot + 1) +
        cleaned.slice(firstDot + 1).replace(/\./g, '')
    );
};

const TextFieldInput = ({
    field,
    label,
    type = 'text',
    autofocus = false,
    startIcon,
    multiline = false,
    maxRows = 3,
}: TextFieldInputProps) => {
    const { errors, isValid, isBlurred } = field.state.meta;
    const isSubmitted = field.form.state.submissionAttempts > 0;
    const isNumber = type === 'number';

    const [showPassword, setShowPassword] = useState(false);

    // Para inputs numéricos guardamos el texto en crudo y así permitir escribir
    // decimales ("12." mientras se teclea). Reconciliamos durante el render cuando
    // el valor del form cambia desde fuera (p. ej. al resetear el formulario).
    const valueAsText =
        field.state.value === undefined || field.state.value === null
            ? ''
            : String(field.state.value);

    const [rawValue, setRawValue] = useState(valueAsText);
    const [syncedValue, setSyncedValue] = useState(field.state.value);

    if (isNumber && field.state.value !== syncedValue) {
        setSyncedValue(field.state.value);
        if (parseNumber(rawValue) !== field.state.value)
            setRawValue(valueAsText);
    }

    const handleNumberChange = (raw: string) => {
        const sanitized = sanitizeNumber(raw);
        setRawValue(sanitized);
        field.handleChange(parseNumber(sanitized));
    };

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
                                        color: 'var(--color-text-38)',
                                        fontSize: 18,
                                    }}
                                />
                            ) : (
                                <VisibilityOutlinedIcon
                                    sx={{
                                        color: 'var(--color-text-38)',
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

    const hasError = !isValid && (isBlurred || isSubmitted);
    const errorId = `${field.name}-error`;

    return (
        <div className='relative flex flex-col'>
            <TextField
                fullWidth
                label={label}
                variant='outlined'
                size='small'
                autoFocus={autofocus}
                multiline={multiline}
                maxRows={maxRows}
                type={
                    isNumber
                        ? 'text'
                        : type === 'password'
                          ? showPassword
                              ? 'text'
                              : 'password'
                          : type
                }
                id={field.name}
                name={field.name}
                value={isNumber ? rawValue : field.state.value}
                onChange={e =>
                    isNumber
                        ? handleNumberChange(e.target.value)
                        : field.handleChange(e.target.value)
                }
                onBlur={field.handleBlur}
                onFocus={e => e.target.select()}
                slotProps={{
                    ...((startIcon || type === 'password') && {
                        input: inputSlotProps,
                    }),
                    htmlInput: {
                        ...(isNumber && { inputMode: 'decimal' }),
                        'aria-invalid': hasError || undefined,
                        'aria-describedby': hasError ? errorId : undefined,
                    },
                }}
                sx={sxInputStyle}
            />
            {hasError && (
                <small
                    id={errorId}
                    className='text-error absolute top-2.5 right-4 font-bold'
                >
                    {errors[0]?.message}
                </small>
            )}
        </div>
    );
};

export default TextFieldInput;
