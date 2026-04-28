import { Route, Routes } from 'react-router';

import Navbar from './layouts/Navbar';
import ProtectedRoute from './layouts/ProtectedRoute';

import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import About from './pages/About';
import ProductDetails from './components/product/ProductDetails';
import Authenticate from './pages/Authenticate';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

function App() {
    const me = useAuthStore(state => state.me);

    useEffect(() => {
        me();
    }, [me]);

    return (
        <Navbar>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/products' element={<Products />} />
                <Route path='/products/:id' element={<ProductDetails />} />
                <Route path='/about' element={<About />} />
                <Route path='/auth' element={<Authenticate />} />

                <Route element={<ProtectedRoute />}>
                    <Route path='/cart' element={<Cart />} />
                </Route>
            </Routes>
        </Navbar>
    );
}

export default App;
