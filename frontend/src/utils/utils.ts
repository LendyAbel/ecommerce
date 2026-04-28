export const sxInputStyle = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        '& fieldset': { borderColor: 'var(--color-border)' },
        '&:hover fieldset': { borderColor: 'var(--color-primary-20)' },
        '&.Mui-focused fieldset': { borderColor: 'var(--color-border-focus)' },
    },
    '& .MuiInputBase-input': { color: 'var(--color-text)' },
    '& .MuiInputBase-input::placeholder': { color: 'var(--color-text-38)', opacity: 1 },
    '& .MuiSelect-select': { color: 'var(--color-text)' },
    '& .MuiInputLabel-root': { color: 'var(--color-text-60)' },
    '& .MuiInputLabel-root.Mui-focused': { color: 'var(--color-primary)' },
    '& .MuiFormLabel-root': { color: 'var(--color-text-60)' },
    '& .MuiFormLabel-root.Mui-focused': { color: 'var(--color-primary)' },
    '& .MuiRadio-root': { color: 'var(--color-text-38)' },
    '& .MuiRadio-root.Mui-checked': { color: 'var(--color-primary)' },
    '& .MuiFormControlLabel-label': { color: 'var(--color-text-60)' },
    '& .MuiSelect-icon': { color: 'var(--color-text-60)' },
    '& input[type=number]': { MozAppearance: 'textfield' },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
        WebkitAppearance: 'none',
        margin: 0,
    },
};

export const sxButtonStyle = {
    color: 'var(--color-primary)',
    borderRadius: '8px',
    borderColor: 'var(--color-border)',
    '&:hover': {
        borderColor: 'var(--color-primary)',
        background: 'var(--color-primary-10)',
    },
    '&.Mui-disabled': {
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-38)',
    },
};

export const sxRadioLabelStyle = {
    '& .MuiFormControlLabel-label': { color: 'var(--color-text-60)' },
    '& .MuiRadio-root': { color: 'var(--color-text-38)' },
    '& .MuiRadio-root.Mui-checked': { color: 'var(--color-primary)' },
};
