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
        <div className='bg-linear-120 from-[#0f0c29] via-[#302b63] to-[#24243e]'>
            {/* Hero */}
            <section className='relative flex min-h-105 flex-col items-center justify-center px-6 py-20 text-center text-white'>
                <p className='mb-2 text-xs font-semibold tracking-[0.3em] text-purple-300 uppercase'>
                    Bienvenido a nuestra tienda
                </p>
                <h1 className='max-w-2xl text-4xl leading-tight font-bold md:text-5xl'>
                    Descubre nuestros productos
                </h1>
                <p className='mt-4 max-w-xl text-base text-white/60'>
                    Encuentra todo lo que necesitas en un solo lugar. Calidad y variedad para ti.
                </p>

                <div className='mt-8 flex flex-wrap items-center justify-center gap-4'>
                    <NavLink
                        to='/products'
                        className='rounded-xl bg-linear-to-r from-[#667eea] to-[#764ba2] px-8 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:opacity-90 active:scale-95'
                    >
                        Ver productos
                    </NavLink>
                    {user && (
                        <NavLink
                            to='/cart'
                            className='rounded-xl border border-white/30 px-8 py-3 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/10 active:scale-95'
                        >
                            Mi carrito
                        </NavLink>
                    )}
                </div>
            </section>

            {/* Productos destacados */}
            <section className='mx-auto w-[90%] max-w-5xl py-14'>
                <h2 className='mb-6 font-[Georgia,serif] text-2xl font-bold text-white'>Productos destacados</h2>

                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                    {isProductsLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                              <ProductCardSkeleton key={i} />
                          ))
                        : featured.map(product => (
                              <ProductCard key={product.id} product={product} />
                          ))}
                </div>

                {!isProductsLoading && featured.length > 0 && (
                    <div className='mt-8 text-center'>
                        <NavLink
                            to='/products'
                            className='rounded-xl border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/70 transition-all duration-200 hover:border-white/40 hover:text-white'
                        >
                            Ver todos los productos
                        </NavLink>
                    </div>
                )}
            </section>

            {/* CTA */}
            <section className='border-t border-white/10 py-14 text-center'>
                {user ? (
                    <p className='text-lg font-medium text-white/70'>
                        Hola de nuevo,{' '}
                        <span className='font-bold text-purple-400'>{user.name}</span>. ¡Que tengas
                        una buena compra!
                    </p>
                ) : (
                    <div className='flex flex-col items-center gap-4'>
                        <p className='text-lg font-medium text-white/70'>
                            ¿Tienes una cuenta? Inicia sesión para comprar.
                        </p>
                        <NavLink
                            to='/auth'
                            className='rounded-xl bg-linear-to-r from-[#667eea] to-[#764ba2] px-8 py-3 text-sm font-bold text-white shadow transition-all duration-200 hover:opacity-90 active:scale-95'
                        >
                            Iniciar sesión
                        </NavLink>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;
