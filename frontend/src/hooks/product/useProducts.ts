import { keepPreviousData, useQuery } from '@tanstack/react-query';
import productsService, { type ProductFilters } from '../../services/products.service';

const useProducts = (filters: ProductFilters = {}) => {
    const {
        data,
        isLoading: isProductsLoading,
        isError: isProductsError,
    } = useQuery({
        queryKey: ['products', filters],
        queryFn: () => productsService.getProducts(filters),
        placeholderData: keepPreviousData,
    });

    const products = data ?? [];

    return { products, isProductsLoading, isProductsError };
};
export default useProducts;
