import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    type SelectChangeEvent,
} from '@mui/material';
import type { AnyFieldApi } from '@tanstack/react-form';
import { useState } from 'react';
import { sxButtonStyle, sxInputStyle } from '../../utils/utils';

type SingleSelectInputProps = {
    field: AnyFieldApi;
    label: string;
    options: Array<string>;
    addOption?: boolean;
};

const SingleSelectInput = ({
    field,
    label,
    options = [],
    addOption = true,
}: SingleSelectInputProps) => {
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryText, setNewCategoryText] = useState('');
    const [localOptions, setLocalOptions] = useState<string[]>(options);

    const { errors, isValid, isTouched } = field.state.meta;

    const handleSelectChange = (e: SelectChangeEvent) => {
        const value = e.target.value || '';
        field.handleChange(value);
    };

    const handleAdd = () => {
        const trimmed = newCategoryText.trim();
        if (!trimmed || localOptions.includes(trimmed)) {
            return;
        }

        const updatedOptions = [...localOptions, trimmed];
        setLocalOptions(updatedOptions);
        field.handleChange(trimmed);
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
                <FormControl sx={sxInputStyle} fullWidth className='relative'>
                    <InputLabel id='select-label'>{label}</InputLabel>
                    <Select
                        labelId='select-label'
                        label={label}
                        variant={'outlined'}
                        id={field.name}
                        name={field.name}
                        value={field.state.value ?? ''}
                        onChange={handleSelectChange}
                        onBlur={field.handleBlur}
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
                    {!isValid && isTouched && (
                        <small className='absolute top-4 right-10 text-error'>
                            {errors[0]?.message}
                        </small>
                    )}
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
                    sx={sxInputStyle}
                />
            )}
            {addOption && (
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
            )}
        </div>
    );
};

export default SingleSelectInput;
