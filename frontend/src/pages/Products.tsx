import { Alert, Box, Skeleton } from '@mui/material';
import productsService from '../services/products.service';
import { useQuery } from '@tanstack/react-query';
import ProductCard from '../components/product/ProductCard'
import type { Product } from '../types/productTypes';

const Products = () => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['products'],
        queryFn: productsService.getProducts,
    });
    const products = data ?? [];
    console.log(products);

    if (isLoading) {
        return (
            <div style={{ width: '80%', margin: 'auto' }}>
                <Skeleton animation='pulse' height={50} />
                <Skeleton animation='pulse' height={50} />
                <Skeleton animation='pulse' height={50} />
                <Skeleton animation='pulse' height={50} />
                <Skeleton animation='pulse' height={50} />
                <Skeleton animation='pulse' height={50} />
            </div>
        );
    }

    if (isError) {
        console.error('Error loading products');
        return (
            <div>
                <Alert severity='error'>Error loading products</Alert>
            </div>
        );
    }

    return (
        <Box
            component={'section'}
            display={'grid'}
            gap={2}
            style={{ width: '80%', margin: 'auto' }}
        >
            {products.map((product: Product) => (
                <div key={product.id}>
                    <ProductCard product={product} />
                </div>
            ))}
        </Box>
    );
};

export default Products;
