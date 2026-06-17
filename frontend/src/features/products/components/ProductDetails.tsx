import { useNavigate, useParams } from 'react-router';
import useProductById from '@/features/products/hooks/useProductById';
import ProductImageGallery from '@/features/products/components/details/ProductImageGallery';
import ProductPrice from '@/features/products/components/details/ProductPrice';
import ProductStockBadge from '@/features/products/components/details/ProductStockBadge';
import ProductActions from '@/features/products/components/details/ProductActions';
import useDeleteProductById from '@/features/products/hooks/useDeleteProductById';
import ProductListSkeleton from '@/features/products/components/skeletons/ProductListSkeleton';
import { useAuthStore } from '@/features/auth/store/authStore';

const ProductDetails = () => {
    const { id } = useParams();
    const { product, isProductError, isProductLoading } = useProductById(id!);
    const userRole = useAuthStore(state => state.user?.role);
    const images = product?.images ?? [];
    const { deleteProductById } = useDeleteProductById();
    const navigate = useNavigate();

    const handleDelete = async () => {
        await deleteProductById(id!);
        navigate('/products');
    };

    if (isProductLoading) {
        return (
            <div className='bg-bg min-h-[calc(100vh-48px)]'>
                <ProductListSkeleton />
            </div>
        );
    }

    if (isProductError || !product) {
        return (
            <div className='bg-bg flex min-h-[calc(100vh-48px)] items-start'>
                <p className='text-error m-auto mt-20 text-center'>
                    Error al cargar el producto
                </p>
            </div>
        );
    }

    // if (isDeleting) {
    //     return (
    //         <div className='flex min-h-[calc(100vh-48px)] items-start bg-bg'>
    //             <p className='m-auto mt-20 text-center text-text-60'>Eliminando producto...</p>
    //         </div>
    //     );
    // }

    return (
        <div className='bg-bg min-h-[calc(100vh-48px)]'>
            <div className='mx-auto w-[90%] max-w-5xl py-10'>
                <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
                    <ProductImageGallery
                        images={images}
                        productName={product.name}
                        productStatus={product.status}
                    />

                    <div className='flex flex-col gap-5'>
                        <div>
                            <p className='text-text-60 text-sm font-medium tracking-widest uppercase'>
                                {product.brand ?? 'Sin marca'} ·{' '}
                                <span className='font-mono'>{product.sku}</span>
                            </p>
                            <h1 className='font-display text-text mt-1 text-3xl leading-tight font-bold'>
                                {product.name}
                            </h1>
                        </div>

                        <ProductPrice price={product.price} tax={product.tax} />

                        <hr className='border-border' />

                        <p className='text-text-60 text-base leading-relaxed'>
                            {product.shortDescription}
                        </p>

                        {product.longDescription && (
                            <p className='text-text-38 text-sm leading-relaxed'>
                                {product.longDescription}
                            </p>
                        )}

                        <hr className='border-border' />

                        <ProductStockBadge stock={product.stock} />

                        <div className='flex flex-wrap gap-2'>
                            {product.mainCategory && (
                                <span className='bg-primary-20 text-primary rounded-full px-3 py-1 text-xs font-semibold'>
                                    {product.mainCategory.name}
                                </span>
                            )}
                            {product.categories?.map(
                                (cat: { id: string; name: string }) => (
                                    <span
                                        key={cat.id}
                                        className='border-border bg-panel text-text-60 rounded-full border px-3 py-1 text-xs font-medium'
                                    >
                                        {cat.name}
                                    </span>
                                ),
                            )}
                        </div>

                        <ProductActions product={product} />

                        {userRole === 'admin' && (
                            <button
                                type='button'
                                onClick={handleDelete}
                                className='border-error/40 text-error hover:bg-error/10 w-full rounded-xl border py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95'
                            >
                                Eliminar producto
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
