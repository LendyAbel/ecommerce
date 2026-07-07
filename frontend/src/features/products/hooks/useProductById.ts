import { useQuery } from '@tanstack/react-query';

import productsService from '../api/products.service';

const useProductById = (id: string) => {
    const {
        data,
        isLoading: isProductLoading,
        isError: isProductError,
    } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productsService.getProductById(id),
        enabled: !!id,
    });
    const product = data ?? null;
    return { product, isProductLoading, isProductError };
};
export default useProductById;
