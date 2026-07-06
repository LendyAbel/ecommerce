import { useIsMutating } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { importProductDetails, routeImports } from '@/app/routePreload';
import { useAuthBootsTrap } from '@/features/auth/hooks/useAuth';
import OrderDetails from '@/features/orders/components/OrderDetails';
import Navbar from '@/layouts/Navbar';
import Alerts from '@/shared/components/Alerts';
import GeneralLoader from '@/shared/components/GeneralLoader';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import { Spinner } from '@/shared/ui';

const Home = lazy(routeImports['/']);
const Products = lazy(routeImports['/products']);
const Cart = lazy(routeImports['/cart']);
const About = lazy(routeImports['/about']);
const ProductDetails = lazy(importProductDetails);
const Authenticate = lazy(routeImports['/auth']);
const Orders = lazy(routeImports['/orders']);
const Address = lazy(routeImports['/account/addresses']);
const Checkout = lazy(routeImports['/checkout']);

const PageFallback = () => (
    <div className='flex min-h-[calc(100vh-48px)] items-center justify-center'>
        <Spinner className='text-primary size-10' label='Cargando' />
    </div>
);

function App() {
    useAuthBootsTrap();

    const isLoggingOut = useIsMutating({ mutationKey: ['logout'] }) > 0;
    const isDeletingProduct =
        useIsMutating({ mutationKey: ['deleteProduct'] }) > 0;

    return (
        <Navbar>
            <Alerts />

            {isLoggingOut && <GeneralLoader label='Cerrando sesión' />}
            {isDeletingProduct && <GeneralLoader label='Eliminando producto' />}

            <Suspense fallback={<PageFallback />}>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/products' element={<Products />} />
                    <Route path='/products/:id' element={<ProductDetails />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/auth' element={<Authenticate />} />
                    <Route path='/cart' element={<Cart />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path='/orders' element={<Orders />} />
                        <Route path='/orders/:id' element={<OrderDetails />} />
                        <Route
                            path='/account/addresses'
                            element={<Address />}
                        />
                        <Route path='/checkout' element={<Checkout />} />
                    </Route>
                </Routes>
            </Suspense>
        </Navbar>
    );
}

export default App;
