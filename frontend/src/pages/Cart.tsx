import { NavLink } from 'react-router';
import { IconButton, Button, Divider, Tooltip } from '@mui/material';
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
            <div className='flex flex-col items-center justify-center gap-4 py-24 text-gray-400'>
                <ShoppingCartOutlinedIcon sx={{ fontSize: 64, opacity: 0.4 }} />
                <p className='text-lg font-medium'>Tu carrito está vacío</p>
                <NavLink
                    to='/products'
                    className='rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700'
                >
                    Ver productos
                </NavLink>
            </div>
        );
    }

    return (
        <div className='mx-auto w-[90%] max-w-5xl py-10'>
            <h1 className='mb-6 text-2xl font-bold text-gray-900'>Tu carrito</h1>

            <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                {/* Lista de items */}
                <div className='flex flex-col gap-4 md:col-span-2'>
                    {items.map(({ product, quantity }) => {
                        const mainImage = product.images?.find(img => img.isMain)?.url
                            ?? product.images?.[0]?.url;
                        return (
                            <div
                                key={product.id}
                                className='flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'
                            >
                                {/* Imagen */}
                                {mainImage ? (
                                    <img
                                        src={mainImage}
                                        alt={product.name}
                                        className='h-20 w-20 rounded-xl object-cover'
                                    />
                                ) : (
                                    <div className='flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 text-gray-300'>
                                        <ShoppingCartOutlinedIcon />
                                    </div>
                                )}

                                {/* Info */}
                                <div className='flex flex-1 flex-col gap-1'>
                                    <p className='font-semibold text-gray-900 leading-tight'>
                                        {product.name}
                                    </p>
                                    <p className='text-sm text-gray-400'>{product.brand}</p>
                                    <p className='text-sm font-medium text-blue-600'>
                                        {formatPrice(product.price)} / ud.
                                    </p>
                                </div>

                                {/* Stepper */}
                                <div className='flex items-center gap-1'>
                                    <Tooltip title='Quitar uno'>
                                        <IconButton
                                            size='small'
                                            onClick={() => updateQuantity(product.id, quantity - 1)}
                                        >
                                            <RemoveIcon fontSize='small' />
                                        </IconButton>
                                    </Tooltip>
                                    <span className='w-6 text-center text-sm font-bold'>
                                        {quantity}
                                    </span>
                                    <Tooltip title='Añadir uno'>
                                        <IconButton
                                            size='small'
                                            onClick={() => updateQuantity(product.id, quantity + 1)}
                                        >
                                            <AddIcon fontSize='small' />
                                        </IconButton>
                                    </Tooltip>
                                </div>

                                {/* Total línea */}
                                <p className='w-20 text-right text-sm font-bold text-gray-800'>
                                    {formatPrice(product.price * quantity)}
                                </p>

                                {/* Eliminar */}
                                <Tooltip title='Eliminar'>
                                    <IconButton
                                        size='small'
                                        color='error'
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
                <div className='h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
                    <h2 className='mb-4 text-lg font-bold text-gray-900'>Resumen</h2>
                    <Divider />

                    <div className='my-4 flex justify-between text-sm text-gray-600'>
                        <span>Subtotal</span>
                        <span className='font-semibold text-gray-900'>{formatPrice(totalPrice)}</span>
                    </div>

                    <Divider />

                    <div className='mt-4 flex flex-col gap-3'>
                        <Button
                            variant='contained'
                            fullWidth
                            disabled
                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
                        >
                            Proceder al pago
                        </Button>
                        <Button
                            variant='outlined'
                            fullWidth
                            color='error'
                            onClick={clearCart}
                            sx={{ borderRadius: 3, textTransform: 'none' }}
                        >
                            Vaciar carrito
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
