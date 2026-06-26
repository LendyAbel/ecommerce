import { memo } from 'react';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import { Badge } from '@/shared/ui';

type ProductStockBadgeProps = {
    stock: number | undefined;
    compact?: boolean;
};

const ProductStockBadge = ({
    stock = 0,
    compact = false,
}: ProductStockBadgeProps) => {
    if (compact) {
        return (
            <Badge variant={stock > 0 ? 'success' : 'error'}>
                <span
                    className={`h-1.5 w-1.5 rounded-full ${stock > 0 ? 'bg-success' : 'bg-error'}`}
                />
                {stock > 0 ? 'En stock' : 'Sin stock'}
            </Badge>
        );
    }

    return (
        <div className='flex items-center gap-2 text-sm'>
            <InventoryOutlinedIcon
                fontSize='small'
                sx={{
                    color:
                        stock > 0
                            ? 'var(--color-success)'
                            : 'var(--color-error)',
                }}
            />
            {stock > 0 ? (
                <span className='text-success font-medium'>
                    {stock} unidades en stock
                </span>
            ) : (
                <span className='text-error font-medium'>Sin stock</span>
            )}
        </div>
    );
};

export default memo(ProductStockBadge);
