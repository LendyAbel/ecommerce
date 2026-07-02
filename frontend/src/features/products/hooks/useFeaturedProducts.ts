import { useQuery } from '@tanstack/react-query';

import productsService from '@/features/products/api/products.service';

/**
 * Productos destacados para la Home: pide solo `limit` items al backend (en vez
 * de traer el catálogo completo y recortar en cliente).
 */
const useFeaturedProducts = (limit = 4) => {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['products', 'featured', limit],
        queryFn: () => productsService.getProducts({ limit }),
    });

    return {
        featured: data?.data ?? [],
        isFeaturedLoading: isLoading,
        isFeaturedError: isError,
    };
};
export default useFeaturedProducts;
