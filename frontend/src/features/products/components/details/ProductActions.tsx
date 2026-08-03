import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useSyncCart } from '@/features/cart/hooks/useSyncCart';
import { useCartStore } from '@/features/cart/store/cartStore';
import type { Product } from '@/features/products/schemas/productSchemas';
import {
    useAddWishItem,
    useRemoveWishItem,
    useWishlist,
} from '@/features/wishlist/hooks/useWishlist';
import { ApiError } from '@/lib/api/client';
import { notify } from '@/shared/store/alertStore';
import { Button } from '@/shared/ui';

type ProductActionsProps = {
    product: Product;
};

const ProductActions = ({ product }: ProductActionsProps) => {
    const addItemToLocalCart = useCartStore(state => state.addItem);
    const user = useAuthStore(state => state.user);
    const { addItemToBackend, addItemIsLoading } = useSyncCart();

    const { data: wishlist } = useWishlist();
    const addToWishlist = useAddWishItem();
    const removeFromWishlist = useRemoveWishItem();

    const isWished =
        wishlist?.wishItems.some(item => item.productId === product.id) ??
        false;

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: product.name, url });
            } catch {
                // El usuario canceló el diálogo nativo de compartir: no es un error.
            }
            return;
        }
        try {
            await navigator.clipboard.writeText(url);
            notify.success('Enlace copiado al portapapeles');
        } catch {
            notify.error('No se pudo copiar el enlace');
        }
    };

    const handleAddToCart = async () => {
        if (user) {
            try {
                await addItemToBackend({ productId: product.id, quantity: 1 });
            } catch (error) {
                notify.error(
                    error instanceof ApiError
                        ? error.message
                        : 'No se pudo añadir el producto al carrito. Inténtalo de nuevo.',
                );
                return;
            }
        }

        const added = addItemToLocalCart({ product });

        if (!added) {
            notify.error('No hay suficiente stock disponible');
            return;
        }
        notify.success('Producto añadido al carrito');
    };

    const handleToggleWishlist = async () => {
        if (!user) {
            notify.info('Inicia sesión para guardar productos en favoritos');
            return;
        }

        try {
            if (isWished) {
                await removeFromWishlist.mutateAsync(product.id);
            } else {
                await addToWishlist.mutateAsync(product.id);
            }
        } catch (error) {
            notify.error(
                error instanceof ApiError
                    ? error.message
                    : 'No se pudo actualizar la lista de deseados. Inténtalo de nuevo.',
            );
        }
    };

    return (
        <div className='flex items-center gap-3 pt-2'>
            <Button
                size='lg'
                leftIcon={<ShoppingCartOutlinedIcon fontSize='small' />}
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                className='flex-1'
                loading={addItemIsLoading}
            >
                Añadir al Carrito
            </Button>
            <Button
                title={
                    isWished ? 'Quitar de favoritos' : 'Guardar en favoritos'
                }
                variant='outline'
                size='lg'
                iconOnly
                onClick={handleToggleWishlist}
                leftIcon={
                    isWished ? (
                        <FavoriteIcon
                            fontSize='small'
                            sx={{ color: 'var(--color-error)' }}
                        />
                    ) : (
                        <FavoriteBorderIcon fontSize='small' />
                    )
                }
                loading={addToWishlist.isPending || removeFromWishlist.isPending}
            />
            <Button
                title='Compartir'
                variant='outline'
                size='lg'
                iconOnly
                onClick={handleShare}
                leftIcon={<ShareOutlinedIcon fontSize='small' />}
            />
        </div>
    );
};

export default ProductActions;
