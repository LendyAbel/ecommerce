import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useNavigate } from 'react-router';

import { useWishlist } from '@/features/wishlist/hooks/useWishlist';
import { EmptyState, ErrorState } from '@/shared/components';
import { Button } from '@/shared/ui';

import WishListSkeleton from './skeletons/WishListSkeleton';
import WishItemCard from './WishItemCard';

const WishList = () => {
    const navigate = useNavigate();
    const { data: wishlist, isLoading, isError, refetch } = useWishlist();

    if (isLoading) return <WishListSkeleton />;

    if (isError) {
        return (
            <ErrorState
                message='No pudimos cargar tu lista de deseados. Inténtalo de nuevo en unos instantes.'
                action={
                    <Button variant='outline' onClick={() => refetch()}>
                        Reintentar
                    </Button>
                }
            />
        );
    }

    if (!wishlist || wishlist.wishItems.length === 0) {
        return (
            <EmptyState
                icon={<FavoriteBorderIcon sx={{ fontSize: 48 }} />}
                title='No hay favoritos'
                message='Añade productos a tu lista de deseados'
                action={
                    <Button className='mt-1' onClick={() => navigate('/products')}>
                        Ver productos
                    </Button>
                }
            />
        );
    }

    return (
        <ul className='flex flex-col gap-3'>
            {wishlist.wishItems.map(item => (
                <li key={item.id}>
                    <WishItemCard item={item} />
                </li>
            ))}
        </ul>
    );
};

export default WishList;
