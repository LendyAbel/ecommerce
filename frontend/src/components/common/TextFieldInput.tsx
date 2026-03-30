import { TextField } from '@mui/material';
import type { AnyFieldApi } from '@tanstack/react-form';

type TextFieldInputProps = {
    field: AnyFieldApi;
    label: string;
    type?: 'text' | 'number' | 'email' | 'password';
};

const TextFieldInput = ({
    field,
    label,
    type = 'text',
}: TextFieldInputProps) => {
    const { errors, isValid, isTouched } = field.state.meta;
    
    return (
        <div className='relative'>
            <TextField
                multiline
                maxRows={3}
                fullWidth
                type={type}
                label={label}
                variant='outlined'
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
            />
            { !isValid && isTouched && (
                <small className='absolute top-4 right-4 text-red-600'>
                    {errors[0]?.message}
                </small>
            )}
        </div>
    );
};

export default TextFieldInput;
