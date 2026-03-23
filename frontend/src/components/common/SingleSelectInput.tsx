import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';
import type { FieldLike } from '../../types/productTypes';
import { useState } from 'react';

type SingleSelectInputProps<T extends string | number> = {
    field: FieldLike<T>;
    label: string;
    options: Array<{ id: string; name: string }>;
};

const SingleSelectInput = <T extends string | number>({
    field,
    label,
    options = [],
}: SingleSelectInputProps<T>) => {
    const [isNewCategory, setIsNewCategory] = useState(false);
    return (
        <div className='flex items-center gap-0.5'>
            {!isNewCategory ? (
                <FormControl fullWidth>
                    <InputLabel id='select-label'>{label}</InputLabel>
                    <Select
                        labelId='select-label'
                        label={label}
                        variant={'outlined'}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={e => field.handleChange(e.target.value as T)}
                    >
                        <MenuItem value=''>
                            <em>None</em>
                        </MenuItem>
                        {options.map((cat: { id: string; name: string }) => (
                            <MenuItem key={cat.id} value={cat.name}>
                                {cat.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <>
                    <TextField
                        fullWidth
                        label={label}
                        variant={'outlined'}
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onChange={e => field.handleChange(e.target.value as T)}
                    />
                </>
            )}

            <Button
                sx={{
                    height: '56px',
                    minWidth: 'max-content',
                    width: '150px',
                }}
                variant={'outlined'}
                onClick={() => setIsNewCategory(!isNewCategory)}
            >
                {isNewCategory ? 'Cancel' : 'New'}
            </Button>
        </div>
    );
};

export default SingleSelectInput;
