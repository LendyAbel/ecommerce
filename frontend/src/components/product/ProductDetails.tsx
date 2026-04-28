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
            <div className='min-h-[calc(100vh-48px)] bg-linear-120 from-[#0f0c29] via-[#302b63] to-[#24243e]'>
                <ProductListSkeleton />
            </div>
        );
    }

    if (isProductError || !product) {
        return (
            <div className='flex min-h-[calc(100vh-48px)] items-start bg-linear-120 from-[#0f0c29] via-[#302b63] to-[#24243e]'>
                <p className='m-auto mt-20 text-center text-red-400'>Error al cargar el producto</p>
            </div>
        );
    }

    if (isDeleting) {
        return (
            <div className='flex min-h-[calc(100vh-48px)] items-start bg-linear-120 from-[#0f0c29] via-[#302b63] to-[#24243e]'>
                <p className='m-auto mt-20 text-center text-white/60'>Eliminando producto...</p>
            </div>
        );
    }

    return (
        <div className='min-h-[calc(100vh-48px)] bg-linear-120 from-[#0f0c29] via-[#302b63] to-[#24243e]'>
            <div className='mx-auto w-[90%] max-w-5xl py-10'>
                <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
                    <ProductImageGallery
                        images={images}
                        productName={product.name}
                        productStatus={product.status}
                    />

                    <div className='flex flex-col gap-5'>
                        <div>
                            <p className='text-sm font-medium tracking-widest text-white/50 uppercase'>
                                {product.brand ?? 'Sin marca'} ·{' '}
                                <span className='font-mono'>{product.sku}</span>
                            </p>
                            <h1 className='mt-1 text-3xl leading-tight font-bold text-white'>
                                {product.name}
                            </h1>
                        </div>

                        <ProductPrice price={product.price} tax={product.tax} />

                        <hr className='border-white/10' />

                        <p className='text-base leading-relaxed text-white/70'>
                            {product.shortDescription}
                        </p>

                        {product.longDescription && (
                            <p className='text-sm leading-relaxed text-white/50'>
                                {product.longDescription}
                            </p>
                        )}

                        <hr className='border-white/10' />

                        <ProductStockBadge stock={product.stock} />

                        <div className='flex flex-wrap gap-2'>
                            {product.mainCategory && (
                                <span className='rounded-full border border-purple-500/30 bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300'>
                                    {product.mainCategory.name}
                                </span>
                            )}
                            {product.categories?.map(
                                (cat: { id: string; name: string }) => (
                                    <span
                                        key={cat.id}
                                        className='rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white/50'
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
                                className='w-full rounded-xl border border-red-500/40 py-2.5 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/10 active:scale-95'
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
