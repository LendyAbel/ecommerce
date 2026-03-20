import { Close } from '@mui/icons-material';
import {
    Button,
    Dialog,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';
import type { NewProductForm } from '../../types/productTypes';
import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import categoriesService from '../../services/categories.service';
import { useState } from 'react';

const formDefaultValues: NewProductForm = {
    name: '',
    brand: '',
    sku: '',
    price: 0,
    tax: 0,
    stock: 0,
    mainCategory: '',
    categories: [],
    images: [],
    shortDescription: '',
    longDescription: '',
};

type NewProductDialogProps = {
    isOpen: boolean;
    onClose: () => void;
};

const NewProductDialog = ({ isOpen, onClose }: NewProductDialogProps) => {
    const [isNewCategory, setIsNewCategory] = useState(false);

    const { data } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesService.getCategories,
    });
    const categories = data ?? [];

    const form = useForm({
        defaultValues: formDefaultValues,
        onSubmit: async ({ value }) => {
            console.log(value);
            onClose();
        },
    });

    const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.handleSubmit();
        console.log('submited');
    };

    const handleCancel = () => {
        form.reset();
        console.log('cancel');
        onClose();
    };

    return (
        <Dialog
            fullWidth
            open={isOpen}
            onClose={onClose}
            className='flex flex-col'
        >
            <DialogTitle className='self-center'>NewProductDialog</DialogTitle>

            {/* -------------FORM--------------- */}
            <form onSubmit={handleSubmit} className='m-2 flex flex-col gap-2'>
                <form.Field
                    name={'name'}
                    children={field => (
                        <>
                            <TextField
                                label={'Name'}
                                variant={'outlined'}
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onChange={e =>
                                    field.handleChange(e.target.value)
                                }
                            />
                        </>
                    )}
                />

                <form.Field
                    name={'mainCategory'}
                    children={field => (
                        <div className='flex items-center gap-0.5'>
                            {!isNewCategory ? (
                                <FormControl fullWidth>
                                    <InputLabel id='mainCategory-label'>
                                        Main Category
                                    </InputLabel>
                                    <Select
                                        labelId='mainCategory-label'
                                        label='Main Category'
                                        variant={'outlined'}
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={e =>
                                            field.handleChange(e.target.value)
                                        }
                                    >
                                        <MenuItem value=''>
                                            <em>None</em>
                                        </MenuItem>
                                        {categories.map(
                                            (cat: {
                                                id: string;
                                                name: string;
                                            }) => (
                                                <MenuItem
                                                    key={cat.id}
                                                    value={cat.name}
                                                >
                                                    {cat.name}
                                                </MenuItem>
                                            ),
                                        )}
                                    </Select>
                                </FormControl>
                            ) : (
                                <>
                                    <TextField fullWidth
                                        label={'Main Category'}
                                        variant={'outlined'}
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={e =>
                                            field.handleChange(e.target.value)
                                        }
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
                    )}
                />

                {/* ------actions buttons--------- */}
                <div className='flex justify-around'>
                    <Button type={'submit'} variant={'contained'}>
                        Submit
                    </Button>
                    <Button
                        type={'reset'}
                        variant={'contained'}
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </form>

            <Button
                sx={{ position: 'absolute', top: 10, right: 10 }}
                variant='text'
                onClick={onClose}
            >
                <Close />
            </Button>
        </Dialog>
    );
};

export default NewProductDialog;
