import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import Navbar from '@/shared/components/Navbar';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import { Spinner } from '@/shared/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Páginas con carga diferida: cada una se empaqueta en su propio chunk y se
// descarga solo al visitar su ruta (code-splitting → bundle inicial más pequeño).
const Home = lazy(() => import('@/pages/Home'));
const Products = lazy(() => import('@/pages/Products'));
const Cart = lazy(() => import('@/pages/Cart'));
const About = lazy(() => import('@/pages/About'));
const ProductDetails = lazy(() => import('@/features/products/components/ProductDetails'));
const Authenticate = lazy(() => import('@/pages/Authenticate'));

const PageFallback = () => (
    <div className='flex min-h-[calc(100vh-48px)] items-center justify-center'>
        <Spinner className='text-primary size-10' label='Cargando' />
    </div>
);

function App() {
    useAuth();

    return (
        <Navbar>
            <Suspense fallback={<PageFallback />}>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/products' element={<Products />} />
                    <Route path='/products/:id' element={<ProductDetails />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/auth' element={<Authenticate />} />
                    <Route path='/cart' element={<Cart />} />

                    {/* Rutas PRIVADAS (requieren sesión). Si no hay usuario,
                        ProtectedRoute redirige a /auth. Aquí irán /checkout,
                        /account, /orders:
                        <Route path='/checkout' element={<Checkout />} /> */}
                    <Route element={<ProtectedRoute />}></Route>
                </Routes>
            </Suspense>
        </Navbar>
    );
}

export default App;
