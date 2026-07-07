import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/features/auth';
import { logger } from '@/lib/logger';
import { useDebounce } from '@/shared/hooks';
import { notify } from '@/shared/store/alertStore';
import { Card } from '@/shared/ui';

import { useSyncCart } from '../hooks/useSyncCart';
import { useCartStore } from '../store/cartStore';
import type { LocalCartItem } from '../types/cartTypes';
import { formatPrice } from '../utils';

interface CartItemCardProps {
    item: LocalCartItem;
    key?: string;
}

const CartItemCard = ({ item, key }: CartItemCardProps) => {
    const { product, quantity } = item;

    const { user } = useAuthStore();

    const cart = useCartStore(state => state.cart);
    const removeItem = useCartStore(state => state.removeItem);
    const updateItem = useCartStore(state => state.updateItem);
    const { updateItemInBackend, removeItemInBackend } = useSyncCart();

    const CART_SYNC_DEBOUNCE_TIME = 500;
    const debounceQuantity = useDebounce(quantity, CART_SYNC_DEBOUNCE_TIME);
    const lastSyncQuantityRef = useRef(quantity);

    // useEffect para esperar el debounce de los clicks al añadir o disminuir
    // productos y sincronizarlos con el backend
    useEffect(() => {
        // Si no hay usuario no hay que sincronizar
        if (!user) return;
        // guard para que no haga sync en el render inicial
        if (debounceQuantity === lastSyncQuantityRef.current) return;
        // vuelve a disparar el useEffect cuando item.id llegue
        if (!item.id) return;

        lastSyncQuantityRef.current = debounceQuantity;
        updateItemInBackend({
            itemId: item.id,
            quantity: debounceQuantity,
        }).catch(() => {
            logger.debug('Error sincronizando cantidad del item:');
        });
    }, [user, debounceQuantity, item.id, updateItemInBackend]);

    const handleUpdate = async (productId: string, quantity: number) => {
        if (quantity <= 0) {
            handleRemove(productId);
            return;
        }

        const updated = updateItem(productId, quantity);
        if (!updated) {
            notify.error('No hay suficiente stock disponible');
            return;
        }
    };

    const handleRemove = async (productId: string) => {
        const item = cart.cartItems.find(i => i.product.id === productId);
        removeItem(productId);

        if (user && item?.id) {
            await removeItemInBackend(item.id);
        }
    };

    const mainImage =
        product.images?.find(img => img.isMain)?.url ??
        product.images?.[0]?.url;

    const deleteButton = (
        <Tooltip title='Eliminar'>
            <IconButton
                size='small'
                sx={{
                    color: 'var(--color-error)',
                    opacity: 0.6,
                    '&:hover': { opacity: 1 },
                }}
                onClick={() => handleRemove(product.id)}
            >
                <DeleteOutlineIcon fontSize='small' />
            </IconButton>
        </Tooltip>
    );
    return (
        <Card
            key={key}
            className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4'
        >
            {/* Imagen + info (+ eliminar en móvil) */}
            <div className='flex items-center gap-4 sm:flex-1'>
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={product.name}
                        loading='lazy'
                        decoding='async'
                        className='size-20 shrink-0 rounded-xl object-cover'
                    />
                ) : (
                    <div className='bg-panel text-text-38 flex size-20 shrink-0 items-center justify-center rounded-xl'>
                        <ShoppingCartOutlinedIcon />
                    </div>
                )}

                <div className='flex min-w-0 flex-1 flex-col gap-1'>
                    <p className='text-text leading-tight font-semibold'>
                        {product.name}
                    </p>
                    <p className='text-text-60 text-sm'>{product.brand}</p>
                    <p className='text-primary text-sm font-medium'>
                        {formatPrice(product.price)} / ud.
                    </p>
                </div>

                <div className='shrink-0 sm:hidden'>{deleteButton}</div>
            </div>

            {/* Controles + total (+ eliminar en desktop) */}
            <div className='flex items-center justify-between gap-2 sm:justify-end sm:gap-4'>
                <div className='flex items-center gap-1'>
                    <Tooltip title='Quitar uno'>
                        <IconButton
                            size='small'
                            sx={{
                                color: 'var(--color-text-60)',
                            }}
                            onClick={() =>
                                handleUpdate(product.id, quantity - 1)
                            }
                        >
                            <RemoveIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                    <span className='text-text w-6 text-center text-sm font-bold'>
                        {quantity}
                    </span>
                    <Tooltip title='Añadir uno'>
                        <IconButton
                            size='small'
                            sx={{
                                color: 'var(--color-text-60)',
                            }}
                            onClick={() =>
                                handleUpdate(product.id, quantity + 1)
                            }
                        >
                            <AddIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                </div>

                <p className='text-text text-right text-sm font-bold sm:w-20'>
                    {formatPrice(product.price * quantity)}
                </p>

                <div className='hidden sm:block'>{deleteButton}</div>
            </div>
        </Card>
    );
};

export default CartItemCard;
