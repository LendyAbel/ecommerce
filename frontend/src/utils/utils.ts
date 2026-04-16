export const sxInputStyle = {
    // Styles for TextField and Select
    '& .MuiOutlinedInput-root': {
        color: 'white',
        borderRadius: '10px',
        '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
        '&.Mui-focused fieldset': { borderColor: '#667eea' },
        background: 'rgba(255,255,255,0.05)',
    },

    // Labels
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.45)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },

    // FormLabel (to "ImagesInput")
    '& .MuiFormLabel-root': { color: 'rgba(255,255,255,0.45)' },
    '& .MuiFormLabel-root.Mui-focused': { color: '#a78bfa' },

    // Radio buttons
    '& .MuiRadio-root': { color: 'rgba(255,255,255,0.45)' },
    '& .MuiRadio-root.Mui-checked': { color: '#667eea' },

    // FormControlLabel (text "Main")
    '& .MuiFormControlLabel-label': { color: 'rgba(255,255,255,0.7)' },

    // Select Icon (arrow)
    '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.45)' },

    // Texto seleccionado en Select
    '& .MuiSelect-select': { color: 'white' },

    // Hide spinners in number inputs
    '& input[type=number]': {
        MozAppearance: 'textfield',
    },
    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
        {
            WebkitAppearance: 'none',
            margin: 0,
        },
};

export const sxButtonStyle = {
    color: 'white',
    borderRadius: '10px',
    borderColor: 'rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    '&:hover': {
        borderColor: 'rgba(255,255,255,0.35)',
        background: 'rgba(255,255,255,0.1)',
    },
};

export const sxRadioLabelStyle = {
    '& .MuiFormControlLabel-label': { color: 'rgba(255,255,255,0.7)' },
    '& .MuiRadio-root': { color: 'rgba(255,255,255,0.45)' },
    '& .MuiRadio-root.Mui-checked': { color: '#667eea' },
};
