import { NavLink } from 'react-router';
import { useAuthStore } from '../store/authStore';
import useProducts from '../hooks/product/useProducts';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/Skeletons/ProductCardSkeleton';

const Home = () => {
    const user = useAuthStore(state => state.user);
    const { products, isProductsLoading } = useProducts();

    const featured = products?.slice(0, 4) ?? [];

    return (
        <div className='bg-bg'>
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

                <p className='relative mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary'>
                    Bienvenido a nuestra tienda
                </p>
                <h1 className='relative max-w-2xl font-display text-4xl font-bold leading-tight text-text md:text-5xl'>
                    Descubre nuestros productos
                </h1>
                <p className='relative mt-4 max-w-xl text-base text-text-60'>
                    Encuentra todo lo que necesitas en un solo lugar. Calidad y variedad para ti.
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
                <h2 className='mb-6 font-display text-2xl font-bold text-text'>
                    Productos destacados
                </h2>

                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                    {isProductsLoading
                        ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                        : featured.map(product => (
                              <ProductCard key={product.id} product={product} />
                          ))}
                </div>

                {!isProductsLoading && featured.length > 0 && (
                    <div className='mt-8 text-center'>
                        <NavLink
                            to='/products'
                            className='btn btn-ghost border border-border px-6 py-2.5 text-sm'
                        >
                            Ver todos los productos
                        </NavLink>
                    </div>
                )}
            </section>

            {/* CTA inferior */}
            <section className='border-t border-border bg-panel py-14 text-center'>
                {user ? (
                    <p className='text-lg font-medium text-text-60'>
                        Hola de nuevo,{' '}
                        <span className='font-bold text-primary'>{user.name}</span>. ¡Que tengas
                        una buena compra!
                    </p>
                ) : (
                    <div className='flex flex-col items-center gap-4'>
                        <p className='text-lg font-medium text-text-60'>
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
