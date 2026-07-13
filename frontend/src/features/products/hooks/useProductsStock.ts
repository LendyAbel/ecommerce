import { useQueries } from '@tanstack/react-query';

import productsService from '../api/products.service';

/**
 * Trae el stock actual de un conjunto de productos (p. ej. las líneas de una
 * orden) en paralelo. Usa la misma queryKey que `useProductById` para
 * compartir caché y evitar refetches duplicados.
 */
const useProductsStock = (productIds: (string | null | undefined)[]) => {
    const ids = [...new Set(productIds.filter((id): id is string => !!id))];

    const results = useQueries({
        queries: ids.map(id => ({
            queryKey: ['product', id],
            queryFn: () => productsService.getProductById(id),
        })),
    });

    const stockByProductId = new Map<string, number>();
    ids.forEach((id, index) => {
        const product = results[index]?.data;
        if (product) {
            stockByProductId.set(id, product.stock ?? 0);
        }
    });

    const isLoading = results.some(result => result.isLoading);

    return { stockByProductId, isLoading };
};

export default useProductsStock;
