import { useIsMutating } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

import { useAuthBootsTrap } from '@/features/auth/';
import { OrderDetails } from '@/features/orders/';
import Navbar from '@/layouts/Navbar';
import { Alerts, GeneralLoader, ProtectedRoute } from '@/shared/components';
import { Spinner } from '@/shared/ui';

import { importProductDetails, routeImports } from './routePreload';

const Home = lazy(routeImports['/']);
const Products = lazy(routeImports['/products']);
const Cart = lazy(routeImports['/cart']);
const About = lazy(routeImports['/about']);
const ProductDetails = lazy(importProductDetails);
const Authenticate = lazy(routeImports['/auth']);
const Orders = lazy(routeImports['/orders']);
const Address = lazy(routeImports['/account/addresses']);
const Checkout = lazy(routeImports['/checkout']);
const CheckoutSuccess = lazy(routeImports['/checkout/success']);
const CheckoutCancel = lazy(routeImports['/checkout/cancel']);

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
                        <Route
                            path='/checkout/success'
                            element={<CheckoutSuccess />}
                        />
                        <Route
                            path='/checkout/cancel'
                            element={<CheckoutCancel />}
                        />
                    </Route>
                </Routes>
            </Suspense>
        </Navbar>
    );
}

export default App;
