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
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                }`}
            >
                <span
                    className={`h-1.5 w-1.5 rounded-full ${stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                />
                {stock > 0 ? 'En stock' : 'Sin stock'}
            </span>
        );
    }

    return (
        <div className='flex items-center gap-2 text-sm'>
            <InventoryOutlinedIcon
                fontSize='small'
                className={stock > 0 ? 'text-green-600' : 'text-red-500'}
            />
            {stock > 0 ? (
                <span className='font-medium text-green-700'>
                    {stock} unidades en stock
                </span>
            ) : (
                <span className='font-medium text-red-500'>Sin stock</span>
            )}
        </div>
    );
};

export default ProductStockBadge;
