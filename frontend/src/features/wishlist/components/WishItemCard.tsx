import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { NavLink } from 'react-router';

import { useRemoveWishItem } from '@/features/wishlist/hooks/useWishlist';
import type { WishItem } from '@/features/wishlist/types/wishlistTypes';
import { ApiError } from '@/lib/api/client';
import { notify } from '@/shared/store/alertStore';
import { Card } from '@/shared/ui';
import { formatCurrency } from '@/shared/utils/format';

type WishItemCardProps = {
    item: WishItem;
};

const WishItemCard = ({ item }: WishItemCardProps) => {
    const { product } = item;
    const removeWishItem = useRemoveWishItem();

    const mainImage =
        product.images?.find(img => img.isMain)?.url ??
        product.images?.[0]?.url;

    const handleRemove = async () => {
        try {
            await removeWishItem.mutateAsync(product.id);
        } catch (error) {
            notify.error(
                error instanceof ApiError
                    ? error.message
                    : 'No se pudo eliminar el producto de favoritos. Inténtalo de nuevo.',
            );
        }
    };

    return (
        <Card className='flex items-center gap-4 p-4'>
            <NavLink to={`/products/${product.id}`} className='shrink-0'>
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={product.name}
                        loading='lazy'
                        decoding='async'
                        className='size-20 rounded-xl object-cover'
                    />
                ) : (
                    <div className='bg-panel text-text-38 flex size-20 items-center justify-center rounded-xl'>
                        <FavoriteBorderIcon />
                    </div>
                )}
            </NavLink>

            <div className='flex min-w-0 flex-1 flex-col gap-1'>
                <NavLink
                    to={`/products/${product.id}`}
                    className='text-text leading-tight font-semibold hover:underline'
                >
                    {product.name}
                </NavLink>
                <p className='text-primary text-sm font-medium'>
                    {formatCurrency(product.price)}
                </p>
            </div>

            <Tooltip title='Eliminar de favoritos'>
                <IconButton
                    size='small'
                    sx={{
                        color: 'var(--color-error)',
                        opacity: 0.6,
                        '&:hover': { opacity: 1 },
                    }}
                    disabled={removeWishItem.isPending}
                    onClick={handleRemove}
                >
                    <DeleteOutlineIcon fontSize='small' />
                </IconButton>
            </Tooltip>
        </Card>
    );
};

export default WishItemCard;
