import { NavLink } from 'react-router';
import { IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useCartStore } from '@/features/cart/store/cartStore';
import { Card } from '@/shared/ui';

const formatPrice = (value: number) =>
    value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

const Cart = () => {
    const cart = useCartStore(state => state.cart);
    const removeItem = useCartStore(state => state.removeItem);
    const updateItem = useCartStore(state => state.updateItem);
    const clearCart = useCartStore(state => state.clearCart);

    const totalPrice = useCartStore(state => state.totalPrice);

    const items = cart?.cartItems ?? [];

    if (items.length === 0) {
        return (
            <div className='bg-bg text-text-38 flex min-h-[calc(100vh-48px)] flex-col items-center justify-center gap-4'>
                <ShoppingCartOutlinedIcon
                    sx={{ fontSize: 64, color: 'var(--color-text-38)' }}
                />
                <p className='text-text-60 text-lg font-medium'>
                    Tu carrito está vacío
                </p>
                <NavLink to='/products' className='btn btn-primary'>
                    Ver productos
                </NavLink>
            </div>
        );
    }

    return (
        <div className='bg-bg min-h-[calc(100vh-48px)]'>
            <div className='mx-auto w-[90%] max-w-5xl py-10'>
                <h1 className='font-display text-text mb-6 text-2xl font-bold'>
                    Tu carrito
                </h1>

                <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                    {/* Lista de items */}
                    <div className='flex flex-col gap-4 md:col-span-2'>
                        {items.map(({ product, quantity }) => {
                            const mainImage =
                                product.images?.find(img => img.isMain)?.url ??
                                product.images?.[0]?.url;
                            return (
                                <Card
                                    key={product.id}
                                    className='flex items-center gap-4 p-4'
                                >
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
                                            <ShoppingCartOutlinedIcon />
                                        </div>
                                    )}

                                    <div className='flex flex-1 flex-col gap-1'>
                                        <p className='text-text leading-tight font-semibold'>
                                            {product.name}
                                        </p>
                                        <p className='text-text-60 text-sm'>
                                            {product.brand}
                                        </p>
                                        <p className='text-primary text-sm font-medium'>
                                            {formatPrice(product.price)} / ud.
                                        </p>
                                    </div>

                                    <div className='flex items-center gap-1'>
                                        <Tooltip title='Quitar uno'>
                                            <IconButton
                                                size='small'
                                                sx={{
                                                    color: 'var(--color-text-60)',
                                                }}
                                                onClick={() =>
                                                    updateItem(
                                                        product.id,
                                                        quantity - 1,
                                                    )
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
                                                    updateItem(
                                                        product.id,
                                                        quantity + 1,
                                                    )
                                                }
                                            >
                                                <AddIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                    </div>

                                    <p className='text-text w-20 text-right text-sm font-bold'>
                                        {formatPrice(product.price * quantity)}
                                    </p>

                                    <Tooltip title='Eliminar'>
                                        <IconButton
                                            size='small'
                                            sx={{
                                                color: 'var(--color-error)',
                                                opacity: 0.6,
                                                '&:hover': { opacity: 1 },
                                            }}
                                            onClick={() =>
                                                removeItem(product.id)
                                            }
                                        >
                                            <DeleteOutlineIcon fontSize='small' />
                                        </IconButton>
                                    </Tooltip>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Resumen */}
                    <Card padded className='h-fit'>
                        <h2 className='font-display text-text mb-4 text-lg font-bold'>
                            Resumen
                        </h2>
                        <hr className='border-border' />

                        <div className='text-text-60 my-4 flex justify-between text-sm'>
                            <span>Subtotal</span>
                            <span className='text-text font-semibold'>
                                {formatPrice(totalPrice())}
                            </span>
                        </div>

                        <hr className='border-border' />

                        <div className='mt-4 flex flex-col gap-3'>
                            <button
                                type='button'
                                disabled
                                className='btn btn-primary btn-full cursor-not-allowed opacity-50'
                            >
                                Proceder al pago
                            </button>
                            <button
                                type='button'
                                onClick={clearCart}
                                className='border-error/40 text-error hover:bg-error/10 w-full rounded-xl border py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95'
                            >
                                Vaciar carrito
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Cart;
