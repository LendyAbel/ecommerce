import { keepPreviousData, useQuery } from '@tanstack/react-query';
import productsService, { type ProductFilters } from '../../services/products.service';

const useProducts = (filters: ProductFilters = {}) => {
    const {
        data,
        isLoading: isProductsLoading,
        isError: isProductsError,
    } = useQuery({
        // Until a paginated UI exists, ask for the max page size so the listing
        // keeps showing the full catalog. `data` is now the paginated envelope.
        queryKey: ['products', filters],
        queryFn: () => productsService.getProducts({ limit: 100, ...filters }),
        placeholderData: keepPreviousData,
    });

    const products = data?.data ?? [];
    const total = data?.total ?? 0;

    return { products, total, isProductsLoading, isProductsError };
};
export default useProducts;
