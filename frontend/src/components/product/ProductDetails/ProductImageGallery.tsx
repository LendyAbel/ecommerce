import { useState } from 'react';
import type { Image, ProductStatus } from '../../../types/productTypes';

const statusConfig: Record<string, { label: string; className: string }> = {
    published: { label: 'Disponible', className: 'bg-success-20 text-success' },
    draft: { label: 'Borrador', className: 'bg-warning-20 text-warning' },
    discontinued: {
        label: 'Descatalogado',
        className: 'bg-panel text-text-60',
    },
};

type ProductImageGalleryProps = {
    images: Image[];
    productName: string;
    productStatus: ProductStatus | undefined;
};

const ProductImageGallery = ({
    images,
    productName,
    productStatus,
}: ProductImageGalleryProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const mainImageUrl =
        images.length > 0
            ? (images.find(i => i.isMain)?.url ?? images[0].url ?? '')
            : '';

    const activeImage = selectedImage ?? mainImageUrl;
    const status = statusConfig[productStatus ?? ''] ?? {
        label: productStatus ?? 'Desconocido',
        className: 'bg-panel text-text-60',
    };

    return (
        <div className='flex flex-col gap-3'>
            <div className='border-border bg-panel relative overflow-hidden rounded-2xl border'>
                {activeImage ? (
                    <img
                        src={activeImage}
                        alt={productName}
                        className='h-105 w-full object-contain transition-all duration-300'
                    />
                ) : (
                    <div className='text-text-38 flex h-105 items-center justify-center'>
                        <svg
                            className=' size-16'
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
                <span
                    className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                >
                    {status.label}
                </span>
            </div>

            {images.length > 1 && (
                <div className='flex gap-2'>
                    {images.map((img: Image) => (
                        <button
                            key={img.id}
                            type='button'
                            onClick={() => setSelectedImage(img.url)}
                            className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                                activeImage === img.url
                                    ? 'border-primary opacity-100'
                                    : 'border-transparent opacity-50 hover:opacity-100'
                            }`}
                        >
                            <img
                                src={img.url}
                                alt=''
                                className='h-full w-full object-cover'
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImageGallery;
