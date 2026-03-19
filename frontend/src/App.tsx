import { Route, Routes } from 'react-router';

import Navbar from './components/layout/Navbar';

import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import About from './pages/About';
import ProductDetails from './components/product/ProductDetails';

function App() {
    return (
        <>
            <Navbar>
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/products' element={<Products />} />
                    <Route path='/cart' element={<Cart />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/products/:id' element={<ProductDetails />} />
                </Routes>
            </Navbar>
        </>
    );
}

export default App;
