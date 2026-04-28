import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';

type ProductStockBadgeProps = {
    stock: number | undefined;
    compact?: boolean;
};

const ProductStockBadge = ({ stock = 0, compact = false }: ProductStockBadgeProps) => {
    if (compact) {
        return (
            <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    stock > 0
                        ? 'bg-success-20 text-success'
                        : 'bg-error-20 text-error'
                }`}
            >
                <span className={`h-1.5 w-1.5 rounded-full ${stock > 0 ? 'bg-success' : 'bg-error'}`} />
                {stock > 0 ? 'En stock' : 'Sin stock'}
            </span>
        );
    }

    return (
        <div className='flex items-center gap-2 text-sm'>
            <InventoryOutlinedIcon
                fontSize='small'
                sx={{ color: stock > 0 ? 'var(--color-success)' : 'var(--color-error)' }}
            />
            {stock > 0 ? (
                <span className='font-medium text-success'>{stock} unidades en stock</span>
            ) : (
                <span className='font-medium text-error'>Sin stock</span>
            )}
        </div>
    );
};

export default ProductStockBadge;
