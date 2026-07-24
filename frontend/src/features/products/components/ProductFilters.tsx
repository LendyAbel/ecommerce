import SearchIcon from '@mui/icons-material/Search';
import {
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';

import type { SortBy } from '@/features/products/schemas/productSchema';
import { sxInputStyle } from '@/shared/utils/muiStyles';

type ProductFiltersProps = {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    selectedCategory: string;
    onCategoryChange: (value: string) => void;
    categories: string[];
    sortBy: SortBy;
    onSortChange: (value: SortBy) => void;
};

const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'newest', label: 'Más recientes' },
    { value: 'oldest', label: 'Más antiguos' },
    { value: 'price_asc', label: 'Precio: menor a mayor' },
    { value: 'price_desc', label: 'Precio: mayor a menor' },
];

const ProductFilters = ({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    categories,
    sortBy,
    onSortChange,
}: ProductFiltersProps) => {
    return (
        <div className='mb-6 flex flex-col gap-4'>
            <div className='flex flex-wrap items-center gap-3'>
                <TextField
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder='Buscar productos...'
                    size='small'
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position='start'>
                                    <SearchIcon
                                        fontSize='small'
                                        sx={{ color: 'var(--color-text-38)' }}
                                    />
                                </InputAdornment>
                            ),
                        },
                        htmlInput: { 'aria-label': 'Buscar productos' },
                    }}
                    sx={{ ...sxInputStyle, flex: '1 1 200px', maxWidth: 360 }}
                />

                <FormControl
                    size='small'
                    sx={{ ...sxInputStyle, minWidth: 200 }}
                >
                    <InputLabel>Ordenar por</InputLabel>
                    <Select
                        value={sortBy}
                        label='Ordenar por'
                        onChange={e => onSortChange(e.target.value as SortBy)}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    bgcolor: 'var(--color-surface)',
                                    color: 'var(--color-text)',
                                    border: '1px solid var(--color-border)',
                                    '& .MuiMenuItem-root:hover': {
                                        bgcolor: 'var(--color-primary-10)',
                                    },
                                    '& .MuiMenuItem-root.Mui-selected': {
                                        bgcolor: 'var(--color-primary-10)',
                                        color: 'var(--color-primary)',
                                    },
                                },
                            },
                        }}
                    >
                        {sortOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

            {categories.length > 0 && (
                <ToggleButtonGroup
                    value={selectedCategory}
                    exclusive
                    onChange={(_, value) => onCategoryChange(value ?? '')}
                    size='small'
                    aria-label='Filtrar por categoría'
                    sx={{
                        flexWrap: 'wrap',
                        gap: 0.5,
                        '& .MuiToggleButton-root': {
                            color: 'var(--color-text-60)',
                            borderColor: 'var(--color-border)',
                            borderRadius: '20px !important',
                            px: 2,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            '&:hover': {
                                background: 'var(--color-primary-10)',
                                borderColor: 'var(--color-primary-20)',
                                color: 'var(--color-primary)',
                            },
                            '&.Mui-selected': {
                                background: 'var(--color-primary)',
                                color: 'white',
                                borderColor: 'transparent',
                                '&:hover': { opacity: 0.9 },
                            },
                        },
                    }}
                >
                    <ToggleButton value=''>Todas</ToggleButton>
                    {categories.map(cat => (
                        <ToggleButton key={cat} value={cat}>
                            {cat}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            )}
        </div>
    );
};

export default ProductFilters;
