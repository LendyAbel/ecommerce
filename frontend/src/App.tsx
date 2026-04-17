import { Route, Routes } from 'react-router';

import Navbar from './components/layout/Navbar';

import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import About from './pages/About';
import ProductDetails from './components/product/ProductDetails';
import Authenticate from './pages/Authenticate';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import useAuth from './hooks/auth/useAuth';

function App() {
    const me = useAuthStore(state => state.me);
    const setUser = useAuthStore(state => state.setUser);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await me();
            } catch {
                setUser(null);
            }
        };
        
        checkAuth();
    }, [me, setUser]);

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
