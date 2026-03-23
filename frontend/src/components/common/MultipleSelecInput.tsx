import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    type SelectChangeEvent,
} from '@mui/material';
import type { FieldLike } from '../../types/productTypes';

type MultipleSelectInputProps<T extends string[]> = {
    field: FieldLike<T>;
    label: string;
    options: Array<{ id: string; name: string }>;
};

const MultipleSelectInput = <T extends string[]>({
    field,
    label,
    options = [],
}: MultipleSelectInputProps<T>) => {
    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const {
            target: { value },
        } = event;
        field.handleChange(value as T);
    };
    return (
        <div className='flex items-center gap-0.5'>
            <FormControl fullWidth>
                <InputLabel id='select-label'>{label}</InputLabel>
                <Select
                    multiple
                    labelId='select-label'
                    label={label}
                    variant={'outlined'}
                    id={field.name}
                    name={field.name}
                    value={(field.state.value ?? []) as string[]}
                    onChange={handleChange}
                >
                    {options.map((cat: { id: string; name: string }) => (
                        <MenuItem key={cat.id} value={cat.name}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
};

export default MultipleSelectInput;
