import { useParams } from 'react-router';
import useProductById from '../../hooks/product/useProductById';

import { Alert, Skeleton, Chip, Divider } from '@mui/material';

import ProductImageGallery from './ProductImageGallery';
import ProductPrice from './ProductPrice';
import ProductStockBadge from './ProductStockBadge';
import ProductActions from './ProductActions';

const ProductDetails = () => {
    const { id } = useParams();
    const { product, isProductError, isProductLoading } = useProductById(id!);
    const images = product?.images ?? [];

    // --- loading ------------------------------
    if (isProductLoading) {
        return (
            <div className='mx-auto w-[90%] max-w-5xl py-10'>
                <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
                    <Skeleton
                        variant='rectangular'
                        height={420}
                        sx={{ borderRadius: 2 }}
                    />
                    <div className='flex flex-col gap-3'>
                        {Array.from({ length: 7 }).map((_, i) => (
                            <Skeleton key={i} animation='pulse' height={40} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- error --------------------------------
    if (isProductError || !product) {
        return (
            <div className='mx-auto w-[90%] max-w-5xl py-10'>
                <Alert severity='error'>Error al cargar el producto</Alert>
            </div>
        );
    }

    // --- render ------------------------------
    return (
        <div className='mx-auto w-[90%] max-w-5xl py-10'>
            <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
                {/* --- Product image ----------------- */}
                <ProductImageGallery
                    images={images}
                    productName={product.name}
                    productStatus={product.status}
                />

                {/* --- Product info ----------------- */}
                <div className='flex flex-col gap-5'>
                    {/* Cabecera */}
                    <div>
                        <p className='text-sm font-medium tracking-widest text-gray-400 uppercase'>
                            {product.brand ?? 'Sin marca'} ·{' '}
                            <span className='font-mono'>{product.sku}</span>
                        </p>
                        <h1 className='mt-1 text-3xl leading-tight font-bold text-gray-900'>
                            {product.name}
                        </h1>
                    </div>

                    {/* Price */}
                    <ProductPrice price={product.price} tax={product.tax} />

                    <Divider />

                    {/* Descripción corta */}
                    <p className='text-base leading-relaxed text-gray-600'>
                        {product.shortDescription}
                    </p>

                    {/* Descripción larga */}
                    {product.longDescription && (
                        <p className='text-sm leading-relaxed text-gray-500'>
                            {product.longDescription}
                        </p>
                    )}

                    <Divider />

                    {/* Stock */}
                    <ProductStockBadge stock={product.stock} />

                    {/* Categorías */}
                    <div className='flex flex-wrap gap-2'>
                        {product.mainCategory && (
                            <Chip
                                label={product.mainCategory.name}
                                color='primary'
                                size='small'
                                variant='filled'
                            />
                        )}
                        {product.categories?.map(
                            (cat: { id: string; name: string }) => (
                                <Chip
                                    key={cat.id}
                                    label={cat.name}
                                    size='small'
                                    variant='outlined'
                                />
                            ),
                        )}
                    </div>

                    {/* Acciones */}
                    <ProductActions stock={product.stock} />
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
