import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useAuthStore } from '@/features/auth';
import { ApiError } from '@/lib/api/client';
import { BackLink, ErrorState, PageContainer } from '@/shared/components';
import { notify } from '@/shared/store/alertStore';
import { Button, Modal } from '@/shared/ui';

import { useDeleteProductById } from '../hooks/useProduct';
import { useProductById } from '../hooks/useProduct';
import type { Product } from '../schemas/productZodSchema';
import ProductActions from './details/ProductActions';
import ProductImageGallery from './details/ProductImageGallery';
import ProductPrice from './details/ProductPrice';
import ProductStockBadge from './details/ProductStockBadge';
import ProductDetailsSkeleton from './skeletons/ProductDetailsSkeleton';

const ProductDetails = () => {
    const { id } = useParams();
    const { product, isProductError, isProductLoading } = useProductById(id!);
    const userRole = useAuthStore(state => state.user?.role);
    const images = product?.images ?? [];
    const { deleteProductById, isPending } = useDeleteProductById();
    const navigate = useNavigate();

    const [toDelete, setToDelete] = useState<Product | null>(null);

    const handleConfirmDelete = async () => {
        if (!toDelete) return;

        try {
            await deleteProductById(id!);
            setToDelete(null);
            navigate('/products');
            notify.info('Producto eliminado');
        } catch (error) {
            notify.error(
                error instanceof ApiError
                    ? error.message
                    : 'No se pudo eliminar el producto. Inténtalo de nuevo.',
            );
        }
    };

    if (isProductLoading) {
        return (
            <PageContainer maxWidth='5xl'>
                <BackLink backLink='/products' backPageName='Productos' />
                <ProductDetailsSkeleton />
            </PageContainer>
        );
    }

    if (isProductError || !product) {
        return (
            <PageContainer maxWidth='5xl'>
                <BackLink backLink='/products' backPageName='Productos' />
                <ErrorState message='No pudimos cargar este producto. Inténtalo de nuevo en unos instantes.' />
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth='5xl'>
            <BackLink backLink='/products' backPageName='Productos' />
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
                        <>
                            <Button
                                variant='danger'
                                fullWidth
                                onClick={() => setToDelete(product)}
                            >
                                Eliminar producto
                            </Button>
                            <Modal
                                open={toDelete != null}
                                onClose={() => setToDelete(null)}
                                title='Eliminar producto'
                            >
                                <div className='px-6 pt-2 pb-6'>
                                    <p className='text-text-60 text-sm'>
                                        ¿Seguro que quieres eliminar este
                                        producto? Esta acción no se puede
                                        deshacer.
                                    </p>
                                    {toDelete && (
                                        <p className='text-text mt-3 text-sm font-medium'>
                                            {toDelete.brand} — {toDelete.name},{' '}
                                            {toDelete.shortDescription}{' '}
                                        </p>
                                    )}
                                    <div className='mt-6 flex justify-end gap-3'>
                                        <Button
                                            variant='outline'
                                            onClick={() => setToDelete(null)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            variant='danger'
                                            loading={isPending}
                                            onClick={handleConfirmDelete}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            </Modal>
                        </>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default ProductDetails;
