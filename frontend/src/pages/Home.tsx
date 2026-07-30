import { NavLink } from 'react-router';

import { useAuthStore } from '@/features/auth/store/authStore';
import ProductCard from '@/features/products/components/ProductCard';
import ProductCardSkeleton from '@/features/products/components/skeletons/ProductCardSkeleton';
import { useFeaturedProducts } from '@/features/products/hooks/useProduct';

const Home = () => {
    const user = useAuthStore(state => state.user);
    const { featured, isLoading } = useFeaturedProducts(4);

    return (
        <div className='bg-bg'>
            <title>Inicio · Voltora</title>
            {/* Hero */}
            <section className='relative flex min-h-105 flex-col items-center justify-center overflow-hidden px-6 py-20 text-center'>
                {/* Fondo decorativo sutil */}
                <div
                    aria-hidden='true'
                    className='pointer-events-none absolute inset-0'
                    style={{
                        background:
                            'radial-gradient(ellipse 80% 60% at 50% 0%, var(--color-primary-10) 0%, transparent 70%)',
                    }}
                />

                <p className='text-primary relative mb-2 text-xs font-semibold tracking-[0.3em] uppercase'>
                    Bienvenido a nuestra tienda
                </p>
                <h1 className='font-display text-text relative max-w-2xl text-4xl leading-tight font-bold md:text-5xl'>
                    Descubre nuestros productos
                </h1>
                <p className='text-text-60 relative mt-4 max-w-xl text-base'>
                    Encuentra todo lo que necesitas en un solo lugar. Calidad y
                    variedad para ti.
                </p>

                <div className='relative mt-8 flex flex-wrap items-center justify-center gap-4'>
                    <NavLink to='/products' className='btn btn-primary btn-lg'>
                        Ver productos
                    </NavLink>
                    {user && (
                        <NavLink to='/cart' className='btn btn-outline btn-lg'>
                            Mi carrito
                        </NavLink>
                    )}
                </div>
            </section>

            {/* Productos destacados */}
            <section className='mx-auto w-[90%] max-w-5xl py-14'>
                <h2 className='font-display text-text mb-6 text-2xl font-bold'>
                    Productos destacados
                </h2>

                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                              <ProductCardSkeleton key={i} />
                          ))
                        : featured.map(product => (
                              <ProductCard key={product.id} product={product} />
                          ))}
                </div>

                {!isLoading && featured.length > 0 && (
                    <div className='mt-8 text-center'>
                        <NavLink
                            to='/products'
                            className='btn btn-ghost border-border border px-6 py-2.5 text-sm'
                        >
                            Ver todos los productos
                        </NavLink>
                    </div>
                )}
            </section>

            {/* CTA inferior */}
            <section className='border-border bg-panel border-t py-14 text-center'>
                {user ? (
                    <p className='text-text-60 text-lg font-medium'>
                        Hola de nuevo,{' '}
                        <span className='text-primary font-bold'>
                            {user.name}
                        </span>
                        . ¡Que tengas una buena compra!
                    </p>
                ) : (
                    <div className='flex flex-col items-center gap-4'>
                        <p className='text-text-60 text-lg font-medium'>
                            ¿Tienes una cuenta? Inicia sesión para comprar.
                        </p>
                        <NavLink to='/auth' className='btn btn-primary btn-lg'>
                            Iniciar sesión
                        </NavLink>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
