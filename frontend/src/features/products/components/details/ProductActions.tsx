import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { useCartStore } from '@/features/cart/store/cartStore';
import type { Product } from '@/features/products/types/productTypes';

type ProductActionsProps = {
    product: Product;
};

const ProductActions = ({ product }: ProductActionsProps) => {
    const addItem = useCartStore(state => state.addItem);

    const handleAddToCart = () => {
        addItem({ product });
    };

    return (
        <div className='flex items-center gap-3 pt-2'>
            <button
                type='button'
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                className='btn btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40'
            >
                <ShoppingCartOutlinedIcon fontSize='small' />
                Añadir al carrito
            </button>

            <button
                type='button'
                title='Guardar en favoritos'
                className='border-border text-text-60 hover:border-primary hover:text-primary flex size-11 items-center justify-center rounded-xl border transition-all duration-200'
            >
                <FavoriteBorderIcon fontSize='small' />
            </button>

            <button
                type='button'
                title='Compartir'
                className='border-border text-text-60 hover:border-primary hover:text-primary flex size-11 items-center justify-center rounded-xl border transition-all duration-200'
            >
                <ShareOutlinedIcon fontSize='small' />
            </button>
        </div>
    );
};

export default ProductActions;
