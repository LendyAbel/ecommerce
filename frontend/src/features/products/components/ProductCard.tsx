import { motion } from 'motion/react';
import { memo, useCallback } from 'react';
import { useNavigate } from 'react-router';

import { preloadProductDetails } from '@/app/routePreload';
import { queryClient } from '@/lib/queryClient';

import productsService from '../api/products.service';
import type { Product } from '../schemas/productSchema';
import ProductPrice from './details/ProductPrice';
import ProductStockBadge from './details/ProductStockBadge';

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const navigate = useNavigate();
    const mainImage =
        product.images?.find(i => i.isMain)?.url ?? product.images?.[0]?.url;

    // Al mostrar intención (hover/focus) precargamos el chunk del detalle y
    // sus datos, reutilizando la misma key/fetcher que `useProductById`. Así la
    // navegación al detalle es instantánea (staleTime global evita refetch).
    const prefetchDetails = useCallback(() => {
        preloadProductDetails();
        queryClient.prefetchQuery({
            queryKey: ['product', product.id],
            queryFn: () => productsService.getProductById(product.id),
        });
    }, [product.id]);

    return (
        <motion.div
            onClick={() => navigate(`/products/${product.id}`)}
            onMouseEnter={prefetchDetails}
            onFocus={prefetchDetails}
            className='border-border bg-surface flex cursor-pointer flex-col overflow-hidden rounded-2xl border'
            whileHover={{
                y: -4,
                boxShadow: 'var(--shadow-lg)',
                borderColor: 'var(--color-primary-20)',
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
        >
            <div className='bg-panel h-48 w-full overflow-hidden'>
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={product.name}
                        loading='lazy'
                        decoding='async'
                        className='h-full w-full object-contain transition-transform duration-300 group-hover:scale-105'
                    />
                ) : (
                    <div className='text-text-38 flex h-full w-full items-center justify-center'>
                        <svg
                            className='size-12'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={1}
                                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                            />
                        </svg>
                    </div>
                )}
            </div>

            <div className='flex flex-1 flex-col gap-2 p-4'>
                <h3 className='text-text truncate font-bold'>{product.name}</h3>
                {product.shortDescription && (
                    <p className='text-text-60 line-clamp-2 flex-1 text-sm'>
                        {product.shortDescription}
                    </p>
                )}
                <div className='flex items-center justify-between pt-1'>
                    <ProductPrice
                        price={product.price}
                        tax={product.tax}
                        compact
                    />
                    <ProductStockBadge stock={product.stock} compact />
                </div>
            </div>
        </motion.div>
    );
};

// memo: en la lista de productos evita re-renderizar cada card cuando el padre
// (Products) se re-renderiza por estado ajeno, p.ej. al teclear en el buscador.
export default memo(ProductCard);
