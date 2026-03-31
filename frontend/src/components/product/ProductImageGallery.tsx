import { useState } from 'react';
import type { Image, ProductStatus } from '../../types/productTypes';
import { Chip } from '@mui/material';

//------- helpers
//------------------------
const statusConfig: Record<
    string,
    { label: string; color: 'success' | 'warning' | 'default' }
> = {
    published: { label: 'Disponible', color: 'success' },
    draft: { label: 'Borrador', color: 'warning' },
    discontinued: { label: 'Descatalogado', color: 'default' },
};

//------- component
//------------------------

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

    let mainImageUrl = ''
    if (images.length > 0) {
        mainImageUrl =
            images.find(i => i.isMain === true)?.url ?? images[0].url ?? '';
    }

    const activeImage = selectedImage ?? mainImageUrl;
    
    const status = statusConfig[productStatus ?? ''] ?? {
        label: productStatus ?? 'Uknown',
        color: 'default',
    };
    return (
        <div className='gap3 flex flex-col'>
            {/*-------------------Imagen---------------------- */}
            <div className='relative overflow-hidden rounded-2xl'>
                {activeImage ? (
                    <img
                        src={activeImage}
                        alt={productName}
                        className='h-105 w-full object-contain transition-all duration-300'
                    />
                ) : (
                    <div className='flex h-105 items-center justify-center text-gray-400'>
                        Sin Imagen
                    </div>
                )}
                {/*-------------------StatusBadge---------------------- */}
                <div className='absolute top-3 left-3'>
                    <Chip label={status.label} color={status.color} />
                </div>
                {/*-------------------MiniImages---------------------- */}
            </div>
            {images.length > 1 && (
                <div className='flex gap-2'>
                    {images.map((img: Image) => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedImage(img.url)}
                            className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition-all duration-200 ${activeImage === img.url ? 'border-blue-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <img
                                src={img.url}
                                alt=''
                                className='object-fit h-full w-full'
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductImageGallery;
