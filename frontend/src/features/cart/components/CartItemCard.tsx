import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { useAuthStore } from '@/features/auth/store/authStore';
import { useSyncCart } from '@/features/cart/hooks/useSyncCart';
import { useCartStore } from '@/features/cart/store/cartStore';
import type { LocalCartItem } from '@/features/cart/types/cartTypes';
import { useDebounce } from '@/shared/hooks';
import { notify } from '@/shared/store/alertStore';
import { Card } from '@/shared/ui';
import { formatCurrency } from '@/shared/utils/format';

interface CartItemCardProps {
    item: LocalCartItem;
}

const CartItemCard = memo(function CartItemCard({ item }: CartItemCardProps) {
    const { product, quantity } = item;
    const [quantityClicked, setQuantityClicked] = useState(quantity);
    const debounceQuantity = useDebounce(quantityClicked, 250);

    const user = useAuthStore(state => state.user);

    const removeItem = useCartStore(state => state.removeItem);
    const updateItem = useCartStore(state => state.updateItem);
    const { updateItemInBackend, removeItemInBackend } = useSyncCart();

    // última cantidad enviada/confirmada al backend, usada por el efecto de
    // sincronización de abajo (no dispara render al mutarla)
    const lastSyncQuantityRef = useRef(quantity);

    // última cantidad de `item.quantity` (store) que ya reflejamos en pantalla
    const [lastAppliedQuantity, setLastAppliedQuantity] = useState(quantity);

    // Si el store cambia por una fuente externa a esta card (login: fetch/merge
    // del carrito), resincroniza la cantidad mostrada durante el render en vez
    // de con un efecto: evita que la card se quede con un valor obsoleto.
    if (quantity !== lastAppliedQuantity) {
        setLastAppliedQuantity(quantity);
        setQuantityClicked(quantity);
    }

    const notStock = quantityClicked >= (product.stock ?? 0);

    const handleRemove = async () => {
        removeItem(product.id);
        if (user) {
            await removeItemInBackend(product.id);
        }
    };

    const handleUpdate = useCallback(async () => {
        const updated = updateItem(product.id, debounceQuantity);
        if (!updated) {
            notify.error('No hay suficiente stock disponible');
            setQuantityClicked(lastSyncQuantityRef.current);
            return;
        }
        lastSyncQuantityRef.current = debounceQuantity;

        if (user) {
            await updateItemInBackend({
                productId: product.id,
                quantity: debounceQuantity,
            });
        }
    }, [debounceQuantity, product.id, user, updateItem, updateItemInBackend]);

    const handleUpdateQuantityClick = (quant: number) => {
        if (quantityClicked + quant <= 0) {
            handleRemove();
            return;
        }

        setQuantityClicked(prev => Math.max(prev + quant, 0));
    };

    // useEffect para esperar el debounce de los clicks al añadir o disminuir
    // productos y sincronizarlos con el backend
    useEffect(() => {
        // guard para que no haga sync en el render inicial
        if (debounceQuantity === lastSyncQuantityRef.current) return;

        handleUpdate();
    }, [debounceQuantity, handleUpdate]);

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
                onClick={handleRemove}
            >
                <DeleteOutlineIcon fontSize='small' />
            </IconButton>
        </Tooltip>
    );
    return (
        <Card className='flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4'>
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
                        {formatCurrency(product.price)} / ud.
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
                            onClick={() => handleUpdateQuantityClick(-1)}
                        >
                            <RemoveIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                    <span className='text-text w-6 text-center text-sm font-bold'>
                        {quantityClicked}
                    </span>
                    <Tooltip title='Añadir uno'>
                        <IconButton
                            disabled={notStock}
                            size='small'
                            sx={{
                                color: 'var(--color-text-60)',
                            }}
                            onClick={() => handleUpdateQuantityClick(1)}
                        >
                            <AddIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                </div>

                <p className='text-text text-right text-sm font-bold sm:w-20'>
                    {formatCurrency(product.price * quantityClicked)}
                </p>

                <div className='hidden sm:block'>{deleteButton}</div>
            </div>
        </Card>
    );
});

export default CartItemCard;
