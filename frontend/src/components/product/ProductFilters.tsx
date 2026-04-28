import { TextField, InputAdornment, ToggleButton, ToggleButtonGroup } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { sxInputStyle } from '../../utils/utils';

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
                                <SearchIcon fontSize='small' sx={{ color: 'rgba(255,255,255,0.4)' }} />
                            </InputAdornment>
                        ),
                    },
                }}
                sx={{ ...sxInputStyle, maxWidth: 360 }}
            />

            {categories.length > 0 && (
                <ToggleButtonGroup
                    value={selectedCategory}
                    exclusive
                    onChange={(_, value) => onCategoryChange(value ?? '')}
                    size='small'
                    sx={{
                        flexWrap: 'wrap',
                        gap: 0.5,
                        '& .MuiToggleButton-root': {
                            color: 'rgba(255,255,255,0.5)',
                            borderColor: 'rgba(255,255,255,0.15)',
                            borderRadius: '20px !important',
                            px: 2,
                            '&:hover': {
                                background: 'rgba(255,255,255,0.08)',
                                borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&.Mui-selected': {
                                background: 'linear-gradient(to right, #667eea, #764ba2)',
                                color: 'white',
                                borderColor: 'transparent',
                                '&:hover': { opacity: 0.9 },
                            },
                        },
                    }}
                >
                    <ToggleButton value=''>
                        Todas
                    </ToggleButton>
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
