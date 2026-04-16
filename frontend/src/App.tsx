import { Route, Routes } from 'react-router';

import Navbar from './components/layout/Navbar';

import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import About from './pages/About';
import ProductDetails from './components/product/ProductDetails';
import Authenticate from './pages/Authenticate';
import authService from './services/auth.service';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await authService.me();
                useAuthStore.getState().setUser(user);
            } catch {
                useAuthStore.getState().setUser(null);
            }
        };

        checkAuth();
    }, []);

    return (
        <>
            <Navbar>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/products' element={<Products />} />
                    <Route path='/cart' element={<Cart />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/products/:id' element={<ProductDetails />} />
                    <Route path='/auth' element={<Authenticate />} />
                </Routes>
            </Navbar>
        </>
    );
}

export default App;
