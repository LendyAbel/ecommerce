import { IconButton, Tooltip } from '@mui/material';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { useCartStore } from '../../../store/cartStore';
import type { Product } from '../../../types/productTypes';

type ProductActionsProps = {
    product: Product;
};

const ProductActions = ({ product }: ProductActionsProps) => {
    const addItem = useCartStore(state => state.addItem);

    return (
        <div className='flex items-center gap-3 pt-2'>
            <button
                disabled={product.stock === 0}
                onClick={() => addItem(product)}
                className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40'
            >
                <ShoppingCartOutlinedIcon fontSize='small' />
                Añadir al carrito
            </button>

            <Tooltip title='Guardar en favoritos'>
                <IconButton className='border border-gray-200'>
                    <FavoriteBorderIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title='Compartir'>
                <IconButton className='border border-gray-200'>
                    <ShareOutlinedIcon />
                </IconButton>
            </Tooltip>
        </div>
    );
};

export default ProductActions;
