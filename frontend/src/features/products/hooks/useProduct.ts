import {
    useInfiniteQuery,
    useMutation,
    useQueries,
    useQuery,
} from '@tanstack/react-query';
import { useState } from 'react';

import {
    createProductMutationOptions,
    deleteProductMutationOptions,
    detailProductQueryOptions,
    featureProductQueryOptions,
    getProductQueryOptions,
} from '@/features/products/api/products.queries';
import type { ProductFilters } from '@/features/products/schemas/productSchemas';

/* Quieries */
export const useProducts = (filters: ProductFilters = {}) => {
    const query = useInfiniteQuery(getProductQueryOptions(filters));

    // Aplana las páginas en una sola lista para la rejilla.
    const products = query.data?.pages.flatMap(page => page.data) ?? [];
    const total = query.data?.pages[0]?.total ?? 0;

    return {
        products,
        total,
        isLoading: query.isLoading,
        isError: query.isError,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
    };
};

export const useFeaturedProducts = (limit = 4) => {
    const query = useQuery(featureProductQueryOptions(limit));

    return {
        featured: query.data?.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
    };
};

export const useProduct = (id: string) => {
    const query = useQuery(detailProductQueryOptions(id));

    const product = query.data ?? null;

    return {
        product,
        isLoading: query.isLoading,
        isError: query.isError,
    };
};

/**
 * Trae el stock actual de un conjunto de productos (p. ej. las líneas de una
 * orden) en paralelo. Usa la misma queryKey que `useProduct` para
 * compartir caché y evitar refetches duplicados.
 */
export const useProductsStock = (productIds: (string | null | undefined)[]) => {
    const ids = [...new Set(productIds.filter((id): id is string => !!id))];

    const results = useQueries({
        queries: ids.map(id => detailProductQueryOptions(id)),
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

/* Mutaciones */
export const useCreateProduct = () => {
    const mutation = useMutation(createProductMutationOptions());
    return {
        createProduct: mutation.mutateAsync,
        isPending: mutation.isPending,
        isError: mutation.isError,
    };
};

export const useDeleteProduct = () => {
    const mutation = useMutation(deleteProductMutationOptions());
    return {
        deleteProduct: mutation.mutateAsync,
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
    };
};

/* Otros*/

// Hook de estados y funciones de Dialog para añadir un producto nuevo
export const useNewProductDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    return { isOpen, open, close };
};
