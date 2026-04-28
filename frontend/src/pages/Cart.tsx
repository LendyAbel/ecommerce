import { NavLink } from 'react-router';
import { IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useCartStore } from '../store/cartStore';

const formatPrice = (value: number) =>
    value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

const Cart = () => {
    const items = useCartStore(state => state.items);
    const removeItem = useCartStore(state => state.removeItem);
    const updateQuantity = useCartStore(state => state.updateQuantity);
    const clearCart = useCartStore(state => state.clearCart);
    const totalPrice = useCartStore(state => state.totalPrice());

    if (items.length === 0) {
        return (
            <div className='flex min-h-[calc(100vh-48px)] flex-col items-center justify-center gap-4 bg-bg text-text-38'>
                <ShoppingCartOutlinedIcon sx={{ fontSize: 64, color: 'var(--color-text-38)' }} />
                <p className='text-lg font-medium text-text-60'>Tu carrito está vacío</p>
                <NavLink to='/products' className='btn btn-primary'>
                    Ver productos
                </NavLink>
            </div>
        );
    }

    return (
        <div className='min-h-[calc(100vh-48px)] bg-bg'>
            <div className='mx-auto w-[90%] max-w-5xl py-10'>
                <h1 className='mb-6 font-display text-2xl font-bold text-text'>Tu carrito</h1>

                <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                    {/* Lista de items */}
                    <div className='flex flex-col gap-4 md:col-span-2'>
                        {items.map(({ product, quantity }) => {
                            const mainImage =
                                product.images?.find(img => img.isMain)?.url ??
                                product.images?.[0]?.url;
                            return (
                                <div
                                    key={product.id}
                                    className='flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm'
                                >
                                    {mainImage ? (
                                        <img
                                            src={mainImage}
                                            alt={product.name}
                                            className='h-20 w-20 rounded-xl object-cover'
                                        />
                                    ) : (
                                        <div className='flex h-20 w-20 items-center justify-center rounded-xl bg-panel text-text-38'>
                                            <ShoppingCartOutlinedIcon />
                                        </div>
                                    )}

                                    <div className='flex flex-1 flex-col gap-1'>
                                        <p className='font-semibold leading-tight text-text'>
                                            {product.name}
                                        </p>
                                        <p className='text-sm text-text-60'>{product.brand}</p>
                                        <p className='text-sm font-medium text-primary'>
                                            {formatPrice(product.price)} / ud.
                                        </p>
                                    </div>

                                    <div className='flex items-center gap-1'>
                                        <Tooltip title='Quitar uno'>
                                            <IconButton
                                                size='small'
                                                sx={{ color: 'var(--color-text-60)' }}
                                                onClick={() =>
                                                    updateQuantity(product.id, quantity - 1)
                                                }
                                            >
                                                <RemoveIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                        <span className='w-6 text-center text-sm font-bold text-text'>
                                            {quantity}
                                        </span>
                                        <Tooltip title='Añadir uno'>
                                            <IconButton
                                                size='small'
                                                sx={{ color: 'var(--color-text-60)' }}
                                                onClick={() =>
                                                    updateQuantity(product.id, quantity + 1)
                                                }
                                            >
                                                <AddIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                    </div>

                                    <p className='w-20 text-right text-sm font-bold text-text'>
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
                                            onClick={() => removeItem(product.id)}
                                        >
                                            <DeleteOutlineIcon fontSize='small' />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            );
                        })}
                    </div>

                    {/* Resumen */}
                    <div className='h-fit rounded-2xl border border-border bg-surface p-6 shadow-sm'>
                        <h2 className='mb-4 font-display text-lg font-bold text-text'>Resumen</h2>
                        <hr className='border-border' />

                        <div className='my-4 flex justify-between text-sm text-text-60'>
                            <span>Subtotal</span>
                            <span className='font-semibold text-text'>{formatPrice(totalPrice)}</span>
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
                                className='w-full rounded-xl border border-error/40 py-2.5 text-sm font-semibold text-error transition-all duration-200 hover:bg-error/10 active:scale-95'
                            >
                                Vaciar carrito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
