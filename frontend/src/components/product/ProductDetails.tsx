import { useNavigate, useParams } from 'react-router';
import useProductById from '../../hooks/product/useProductById';
import { Alert } from '@mui/material';
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

    if (isProductLoading) return <ProductListSkeleton />;

    if (isProductError || !product) {
        return (
            <div className='mx-auto w-[90%] max-w-5xl py-10'>
                <Alert severity='error'>Error al cargar el producto</Alert>
            </div>
        );
    }

    if (isDeleting) {
        return (
            <div className='mx-auto w-[90%] max-w-5xl py-10'>
                <Alert severity='info'>Eliminando producto...</Alert>
            </div>
        );
    }

    return (
        <div className='mx-auto w-[90%] max-w-5xl py-10'>
            <div className='grid grid-cols-1 gap-10 md:grid-cols-2'>
                <ProductImageGallery
                    images={images}
                    productName={product.name}
                    productStatus={product.status}
                />

                <div className='flex flex-col gap-5'>
                    <div>
                        <p className='text-sm font-medium tracking-widest text-gray-400 uppercase'>
                            {product.brand ?? 'Sin marca'} ·{' '}
                            <span className='font-mono'>{product.sku}</span>
                        </p>
                        <h1 className='mt-1 text-3xl leading-tight font-bold text-gray-900'>
                            {product.name}
                        </h1>
                    </div>

                    <ProductPrice price={product.price} tax={product.tax} />

                    <hr className='border-gray-100' />

                    <p className='text-base leading-relaxed text-gray-600'>
                        {product.shortDescription}
                    </p>

                    {product.longDescription && (
                        <p className='text-sm leading-relaxed text-gray-500'>
                            {product.longDescription}
                        </p>
                    )}

                    <hr className='border-gray-100' />

                    <ProductStockBadge stock={product.stock} />

                    <div className='flex flex-wrap gap-2'>
                        {product.mainCategory && (
                            <span className='rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700'>
                                {product.mainCategory.name}
                            </span>
                        )}
                        {product.categories?.map(
                            (cat: { id: string; name: string }) => (
                                <span
                                    key={cat.id}
                                    className='rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600'
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
                            className='w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-500 transition-all duration-200 hover:bg-red-50 active:scale-95'
                        >
                            Eliminar producto
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
