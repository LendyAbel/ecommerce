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
                type='button'
                disabled={product.stock === 0}
                onClick={() => addItem(product)}
                className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#667eea] to-[#764ba2] px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40'
            >
                <ShoppingCartOutlinedIcon fontSize='small' />
                Añadir al carrito
            </button>

            <button
                type='button'
                title='Guardar en favoritos'
                className='flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition-all duration-200 hover:border-purple-300 hover:text-purple-500'
            >
                <FavoriteBorderIcon fontSize='small' />
            </button>

            <button
                type='button'
                title='Compartir'
                className='flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition-all duration-200 hover:border-purple-300 hover:text-purple-500'
            >
                <ShareOutlinedIcon fontSize='small' />
            </button>
        </div>
    );
};

export default ProductActions;
