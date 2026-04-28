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
            <div className='flex min-h-[calc(100vh-48px)] flex-col items-center justify-center gap-4 bg-linear-120 from-[#0f0c29] via-[#302b63] to-[#24243e] text-white/50'>
                <ShoppingCartOutlinedIcon sx={{ fontSize: 64, opacity: 0.4 }} />
                <p className='text-lg font-medium'>Tu carrito está vacío</p>
                <NavLink
                    to='/products'
                    className='rounded-xl bg-linear-to-r from-[#667eea] to-[#764ba2] px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95'
                >
                    Ver productos
                </NavLink>
            </div>
        );
    }

    return (
        <div className='min-h-[calc(100vh-48px)] bg-linear-120 from-[#0f0c29] via-[#302b63] to-[#24243e]'>
            <div className='mx-auto w-[90%] max-w-5xl py-10'>
                <h1 className='mb-6 font-[Georgia,serif] text-2xl font-bold text-white'>Tu carrito</h1>

                <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                    {/* Lista de items */}
                    <div className='flex flex-col gap-4 md:col-span-2'>
                        {items.map(({ product, quantity }) => {
                            const mainImage = product.images?.find(img => img.isMain)?.url
                                ?? product.images?.[0]?.url;
                            return (
                                <div
                                    key={product.id}
                                    className='flex items-center gap-4 rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-4 backdrop-blur-sm'
                                >
                                    {mainImage ? (
                                        <img
                                            src={mainImage}
                                            alt={product.name}
                                            className='h-20 w-20 rounded-xl object-cover'
                                        />
                                    ) : (
                                        <div className='flex h-20 w-20 items-center justify-center rounded-xl bg-white/5 text-white/20'>
                                            <ShoppingCartOutlinedIcon />
                                        </div>
                                    )}

                                    <div className='flex flex-1 flex-col gap-1'>
                                        <p className='font-semibold leading-tight text-white'>
                                            {product.name}
                                        </p>
                                        <p className='text-sm text-white/40'>{product.brand}</p>
                                        <p className='text-sm font-medium text-purple-400'>
                                            {formatPrice(product.price)} / ud.
                                        </p>
                                    </div>

                                    <div className='flex items-center gap-1'>
                                        <Tooltip title='Quitar uno'>
                                            <IconButton
                                                size='small'
                                                sx={{ color: 'rgba(255,255,255,0.6)' }}
                                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                            >
                                                <RemoveIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                        <span className='w-6 text-center text-sm font-bold text-white'>
                                            {quantity}
                                        </span>
                                        <Tooltip title='Añadir uno'>
                                            <IconButton
                                                size='small'
                                                sx={{ color: 'rgba(255,255,255,0.6)' }}
                                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                            >
                                                <AddIcon fontSize='small' />
                                            </IconButton>
                                        </Tooltip>
                                    </div>

                                    <p className='w-20 text-right text-sm font-bold text-white'>
                                        {formatPrice(product.price * quantity)}
                                    </p>

                                    <Tooltip title='Eliminar'>
                                        <IconButton
                                            size='small'
                                            sx={{ color: 'rgba(239,68,68,0.7)', '&:hover': { color: 'rgb(239,68,68)' } }}
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
                    <div className='h-fit rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] p-6 backdrop-blur-sm'>
                        <h2 className='mb-4 text-lg font-bold text-white'>Resumen</h2>
                        <hr className='border-white/10' />

                        <div className='my-4 flex justify-between text-sm text-white/60'>
                            <span>Subtotal</span>
                            <span className='font-semibold text-white'>{formatPrice(totalPrice)}</span>
                        </div>

                        <hr className='border-white/10' />

                        <div className='mt-4 flex flex-col gap-3'>
                            <button
                                type='button'
                                disabled
                                className='w-full cursor-not-allowed rounded-xl bg-linear-to-r from-[#667eea] to-[#764ba2] py-2.5 text-sm font-bold text-white opacity-50'
                            >
                                Proceder al pago
                            </button>
                            <button
                                type='button'
                                onClick={clearCart}
                                className='w-full rounded-xl border border-red-500/40 py-2.5 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/10 active:scale-95'
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
