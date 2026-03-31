import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';

type ProductStockBadgeProps = {
    stock: number | undefined;
};

const ProductStockBadge = ({ stock = 0 }: ProductStockBadgeProps) => {
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
