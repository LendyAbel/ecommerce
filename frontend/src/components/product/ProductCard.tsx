import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import type { Product } from '../../types/productTypes';
import ProductStockBadge from './ProductDetails/ProductStockBadge';
import ProductPrice from './ProductDetails/ProductPrice';

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const navigate = useNavigate();
    const mainImage =
        product.images?.find(i => i.isMain)?.url ?? product.images?.[0]?.url;

    return (
        <motion.div
            onClick={() => navigate(`/products/${product.id}`)}
            className='flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface'
            whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)', borderColor: 'var(--color-primary-20)' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
        >
            <div className='h-48 w-full overflow-hidden bg-panel'>
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={product.name}
                        className='h-full w-full object-contain transition-transform duration-300 group-hover:scale-105'
                    />
                ) : (
                    <div className='flex h-full w-full items-center justify-center text-text-38'>
                        <svg className='h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1} d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
                        </svg>
                    </div>
                )}
            </div>

            <div className='flex flex-1 flex-col gap-2 p-4'>
                <h3 className='truncate font-bold text-text'>{product.name}</h3>
                {product.shortDescription && (
                    <p className='line-clamp-2 flex-1 text-sm text-text-60'>
                        {product.shortDescription}
                    </p>
                )}
                <div className='flex items-center justify-between pt-1'>
                    <ProductPrice price={product.price} tax={product.tax} compact />
                    <ProductStockBadge stock={product.stock} compact />
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
