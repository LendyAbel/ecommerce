import { Alert, Box } from '@mui/material';
import ProductCard from '../components/product/ProductCard';
import type { Product } from '../types/productTypes';
import useProducts from '../hooks/product/useProducts';
import AddProductButton from '../components/product/AddProductButtom';
import useNewProductDialog from '../hooks/product/useNewProductDialog';
import NewProductDialog from '../components/product/NewProductDialog';
import ProductCardSkeleton from '../components/product/Skeletons/ProductCardSkeleton';
import { useAuthStore } from '../store/authStore';

const Products = () => {
    const { products, isProductsError, isProductsLoading } = useProducts();
    const userRole = useAuthStore(state => state.user?.role);

    const { isOpen, open, close } = useNewProductDialog();
    // --- loading ------------------------------
    if (isProductsLoading) {
        return (
            <div className='m-auto w-[80%]'>
                {Array.from({ length: 6 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }
    // --- error --------------------------------
    if (isProductsError) {
        console.error('Error loading products');
        return (
            <div className='m-auto w-[80%]'>
                <Alert severity='error'>Error loading products</Alert>
            </div>
        );
    }

    return (
        <div className='relative h-screen'>
            <Box
                component={'section'}
                display={'grid'}
                gap={2}
                className='m-auto mt-2 w-[80%]'
            >
                {products?.map((product: Product) => (
                    <div key={product.id}>
                        <ProductCard product={product} />
                    </div>
                ))}
            </Box>
            {userRole === 'admin' && <AddProductButton onClick={open} />}
            <NewProductDialog isOpen={isOpen} onClose={close} />
        </div>
    );
};

export default Products;
