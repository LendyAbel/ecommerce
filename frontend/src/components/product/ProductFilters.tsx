import { InputAdornment, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type ProductFiltersProps = {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    selectedCategory: string;
    onCategoryChange: (value: string) => void;
    categories: string[];
};

const ProductFilters = ({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    categories,
}: ProductFiltersProps) => {
    return (
        <div className='mb-6 flex flex-col gap-4'>
            <TextField
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                placeholder='Buscar productos...'
                size='small'
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position='start'>
                                <SearchIcon fontSize='small' sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                        ),
                    },
                }}
                sx={{ maxWidth: 360 }}
            />

            {categories.length > 0 && (
                <ToggleButtonGroup
                    value={selectedCategory}
                    exclusive
                    onChange={(_, value) => onCategoryChange(value ?? '')}
                    size='small'
                    sx={{ flexWrap: 'wrap', gap: 0.5 }}
                >
                    <ToggleButton value='' sx={{ borderRadius: '20px !important', px: 2 }}>
                        Todas
                    </ToggleButton>
                    {categories.map(cat => (
                        <ToggleButton
                            key={cat}
                            value={cat}
                            sx={{ borderRadius: '20px !important', px: 2 }}
                        >
                            {cat}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            )}
        </div>
    );
};

export default ProductFilters;
