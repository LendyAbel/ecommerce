import { useNavigate, useParams } from 'react-router';
import useProductById from '../../hooks/product/useProductById';
import ProductImageGallery from './ProductDetails/ProductImageGallery';
import ProductPrice from './ProductDetails/ProductPrice';
import ProductStockBadge from './ProductDetails/ProductStockBadge';
import ProductActions from './ProductDetails/ProductActions';
import useDeleteProductById from '../../hooks/product/useDeleteProductById';
import ProductListSkeleton from './Skeletons/ProductListSkeleton';
import { useAuthStore } from '../../store/authStore';

const ProductDetails = () => {
    const { id } = useParams();
    const { product, isProductError, isProductLoading } = useProductById(id!);
    const userRole = useAuthStore(state => state.user?.role);
    const images = product?.images ?? [];
    const { deleteProductById, isPending: isDeleting } = useDeleteProductById();
    const navigate = useNavigate();

    const handleDelete = async () => {
        await deleteProductById(id!);
        navigate('/products');
    };

    if (isProductLoading) {
        return (
            <div className='min-h-[calc(100vh-48px)] bg-bg'>
                <ProductListSkeleton />
            </div>
        );
    }

    if (isProductError || !product) {
        return (
            <div className='flex min-h-[calc(100vh-48px)] items-start bg-bg'>
                <p className='m-auto mt-20 text-center text-error'>Error al cargar el producto</p>
            </div>
        );
    }

    if (isDeleting) {
        return (
            <div className='flex min-h-[calc(100vh-48px)] items-start bg-bg'>
                <p className='m-auto mt-20 text-center text-text-60'>Eliminando producto...</p>
            </div>
        );
    }

    return (
        <div className='min-h-[calc(100vh-48px)] bg-bg'>
            <div className='mx-auto w-[90%] max-w-5xl py-10'>
                <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
                    <ProductImageGallery
                        images={images}
                        productName={product.name}
                        productStatus={product.status}
                    />

                    <div className='flex flex-col gap-5'>
                        <div>
                            <p className='text-sm font-medium uppercase tracking-widest text-text-60'>
                                {product.brand ?? 'Sin marca'} ·{' '}
                                <span className='font-mono'>{product.sku}</span>
                            </p>
                            <h1 className='mt-1 font-display text-3xl font-bold leading-tight text-text'>
                                {product.name}
                            </h1>
                        </div>

                        <ProductPrice price={product.price} tax={product.tax} />

                        <hr className='border-border' />

                        <p className='text-base leading-relaxed text-text-60'>
                            {product.shortDescription}
                        </p>

                        {product.longDescription && (
                            <p className='text-sm leading-relaxed text-text-38'>
                                {product.longDescription}
                            </p>
                        )}

                        <hr className='border-border' />

                        <ProductStockBadge stock={product.stock} />

                        <div className='flex flex-wrap gap-2'>
                            {product.mainCategory && (
                                <span className='rounded-full bg-primary-20 px-3 py-1 text-xs font-semibold text-primary'>
                                    {product.mainCategory.name}
                                </span>
                            )}
                            {product.categories?.map(
                                (cat: { id: string; name: string }) => (
                                    <span
                                        key={cat.id}
                                        className='rounded-full border border-border bg-panel px-3 py-1 text-xs font-medium text-text-60'
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
                                className='w-full rounded-xl border border-error/40 py-2.5 text-sm font-semibold text-error transition-all duration-200 hover:bg-error/10 active:scale-95'
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
