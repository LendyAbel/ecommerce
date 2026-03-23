import { TextField } from '@mui/material';
import type { FieldLike } from '../../types/productTypes';

type TextFieldInputProps<T extends string | number> = {
    field: FieldLike<T>;
    label: string;
    type?: 'text' | 'number' | 'email' | 'password';
};

const TextFieldInput = <TValue extends string | number>({
    field,
    label,
    type = 'text',
}: TextFieldInputProps<TValue>) => {
    return (
        <TextField
            fullWidth
            type={type}
            label={label}
            variant='outlined'
            id={field.name}
            name={field.name}
            value={field.state.value}
            onChange={e =>
                field.handleChange(
                    (type === 'number'
                        ? Number(e.target.value)
                        : e.target.value) as TValue,
                )
            }
            onBlur={field.handleBlur}
        />
    );
};

export default TextFieldInput;
