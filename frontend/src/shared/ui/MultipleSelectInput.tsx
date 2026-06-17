import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    type SelectChangeEvent,
} from '@mui/material';
import { useState } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';
import { sxButtonStyle, sxInputStyle } from '@/shared/utils/utils';

type MultipleSelectInputProps = {
    field: AnyFieldApi;
    label: string;
    options: string[];
};

const MultipleSelectInput = ({
    field,
    label,
    options = [],
}: MultipleSelectInputProps) => {
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryText, setNewCategoryText] = useState('');
    const [localOptions, setLocalOptions] = useState<string[]>(options);

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        field.handleChange(value as string[]);
    };

    const handleAdd = () => {
        const trimmed = newCategoryText.trim();
        if (!trimmed) return;

        if (!localOptions.includes(trimmed)) {
            setLocalOptions(prev => [...prev, trimmed]);
        }

        const currentValue = field.state.value ?? [];
        if (!currentValue.includes(trimmed)) {
            field.handleChange([...currentValue, trimmed]);
        }

        setNewCategoryText('');
        setIsNewCategory(false);
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
                <FormControl fullWidth sx={sxInputStyle}>
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
                    label={`New ${label}`}
                    variant='outlined'
                    value={newCategoryText}
                    onChange={e => setNewCategoryText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    sx={sxInputStyle}
                />
            )}
            <div className='flex w-53 flex-row'>
                <Button
                    className='h-14 w-full min-w-max'
                    variant={'outlined'}
                    onClick={() => setIsNewCategory(!isNewCategory)}
                    sx={sxButtonStyle}
                >
                    {isNewCategory ? 'Cancel' : 'New'}
                </Button>
                {isNewCategory && (
                    <Button
                        variant={'outlined'}
                        onClick={handleAdd}
                        disabled={!newCategoryText.trim()}
                        sx={sxButtonStyle}
                    >
                        Add
                    </Button>
                )}
            </div>
        </div>
    );
};

export default MultipleSelectInput;
