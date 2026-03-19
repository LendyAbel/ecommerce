import { useQuery } from '@tanstack/react-query';
import productsService from '../../services/products.service';

const useProducts = () => {
    const {
        data,
        isLoading: isProductsLoading,
        isError: isProductsError,
    } = useQuery({
        queryKey: ['products'],
        queryFn: productsService.getProducts,
    });

    const products = data ?? [];

    return { products, isProductsLoading, isProductsError };
};
export default useProducts;
