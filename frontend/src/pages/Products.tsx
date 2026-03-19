import { Alert, Box, Skeleton } from '@mui/material';
import ProductCard from '../components/product/ProductCard';
import type { Product } from '../types/productTypes';
import useProducts from '../hooks/product/useProducts';

const Products = () => {
    const { products, isProductsError, isProductsLoading } = useProducts();
    console.log(products);

    if (isProductsLoading) {
        return (
            <div className='m-auto w-[80%]'>
                <Skeleton animation='pulse' height={50} />
                <Skeleton animation='pulse' height={50} />
                <Skeleton animation='pulse' height={50} />
                <Skeleton animation='pulse' height={50} />
                <Skeleton animation='pulse' height={50} />
                <Skeleton animation='pulse' height={50} />
            </div>
        );
    }

    if (isProductsError) {
        console.error('Error loading products');
        return (
            <div className='m-auto w-[80%]'>
                <Alert severity='error'>Error loading products</Alert>
            </div>
        );
    }

    return (
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
    );
};

export default Products;
