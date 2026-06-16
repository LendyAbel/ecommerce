import { Route, Routes } from 'react-router';

import Navbar from './layouts/Navbar';
import ProtectedRoute from './layouts/ProtectedRoute';

import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import About from './pages/About';
import ProductDetails from './components/product/ProductDetails';
import Authenticate from './pages/Authenticate';
import { useAuth } from './hooks/auth/useAuth';

function App() {
    useAuth();

    return (
        <Navbar>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/products' element={<Products />} />
                <Route path='/products/:id' element={<ProductDetails />} />
                <Route path='/about' element={<About />} />
                <Route path='/auth' element={<Authenticate />} />
                <Route path='/cart' element={<Cart />} />

                <Route element={<ProtectedRoute />}>
                {/* Rutas PRIVADAS (requieren sesión). Si no hay usuario,
                    ProtectedRoute redirige a /auth. Aquí irán /checkout,
                    /account, /orders:
                    <Route path='/checkout' element={<Checkout />} /> */}
                </Route>
            </Routes>
        </Navbar>
    );
}

export default App;
