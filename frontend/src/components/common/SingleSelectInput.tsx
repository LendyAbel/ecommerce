import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    type SelectChangeEvent,
} from '@mui/material';
import type { FieldLike } from '../../types/productTypes';
import { useState } from 'react';

type SingleSelectInputProps<T extends string | number> = {
    field: FieldLike<T>;
    label: string;
    options: Array<string>;
};

const SingleSelectInput = <T extends string | number>({
    field,
    label,
    options = [],
}: SingleSelectInputProps<T>) => {
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryText, setNewCategoryText] = useState('');
    const [localOptions, setLocalOptions] = useState<string[]>(options);

    const handleSelectChange = (e: SelectChangeEvent<T>) => {
        const value = e.target.value || ''; // "" si selecciona "None"
        field.handleChange(value as T);
    };

    const handleAdd = () => {
        const trimmed = newCategoryText.trim();
        if (!trimmed || localOptions.includes(trimmed)) {
            return;
        }

        const updatedOptions = [...localOptions, trimmed];
        setLocalOptions(updatedOptions);
        field.handleChange(trimmed as T);
        setNewCategoryText('');
        setIsNewCategory(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCategoryText(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

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
                        value={field.state.value ?? ''}
                        onChange={handleSelectChange}
                    >
                        <MenuItem value=''>
                            <em>None</em>
                        </MenuItem>
                        {localOptions.map(cat => (
                            <MenuItem key={cat} value={cat}>
                                {cat}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            ) : (
                <TextField
                    fullWidth
                    autoFocus
                    label={`New ${label}`}
                    variant='outlined'
                    value={newCategoryText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
            )}

            <div className='flex w-53 flex-row'>
                <Button
                    className='h-14 w-full min-w-max'
                    variant={'outlined'}
                    onClick={() => setIsNewCategory(!isNewCategory)}
                >
                    {isNewCategory ? 'Cancel' : 'New'}
                </Button>
                {isNewCategory && (
                    <Button
                        variant={'outlined'}
                        onClick={handleAdd}
                        disabled={!newCategoryText.trim()}
                    >
                        Add
                    </Button>
                )}
            </div>
        </div>
    );
};

export default SingleSelectInput;
