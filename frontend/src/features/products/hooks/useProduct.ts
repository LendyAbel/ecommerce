import {
    keepPreviousData,
    useInfiniteQuery,
    useMutation,
    useQueries,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';

import { logger } from '@/lib/logger';

import productsService, { type ProductFilters } from '../api/products.service';
import type { ProductForm } from '../schemas/productZodSchema';

export const PRODUCT_KEY = ['products'];
const PAGE_SIZE = 6;

export const useGetProducts = (filters: ProductFilters = {}) => {
    const query = useInfiniteQuery({
        queryKey: [...PRODUCT_KEY, filters],
        queryFn: ({ pageParam }) =>
            productsService.getProducts({
                ...filters,
                page: pageParam,
                limit: PAGE_SIZE,
            }),
        initialPageParam: 1,
        getNextPageParam: lastPage => {
            const loaded = lastPage.page * lastPage.limit;
            return loaded < lastPage.total ? lastPage.page + 1 : undefined;
        },
        placeholderData: keepPreviousData,
    });

    // Aplana las páginas en una sola lista para la rejilla.
    const products = query.data?.pages.flatMap(page => page.data) ?? [];
    const total = query.data?.pages[0]?.total ?? 0;

    return {
        products,
        total,
        isProductsLoading: query.isLoading,
        isProductsError: query.isError,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
    };
};

export const useAddNewProduct = () => {
    const qc = useQueryClient();
    const {
        mutateAsync: addNewProduct,
        isPending,
        isError,
    } = useMutation({
        mutationFn: (newProductData: ProductForm) =>
            productsService.addNewProduct(newProductData),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({
                    queryKey: ['products'],
                }),
                qc.invalidateQueries({
                    queryKey: ['categories'],
                }),
            ]);
        },
        onError: error => {
            logger.error('Error al crear producto:', error);
        },
    });
    return { addNewProduct, isPending, isError };
};

export const useDeleteProductById = () => {
    const qc = useQueryClient();
    const {
        mutateAsync: deleteProductById,
        isPending,
        isSuccess,
    } = useMutation({
        mutationKey: ['deleteProduct'],
        mutationFn: (id: string) => productsService.deleteProductById(id),
        onSuccess: async (_data, id) => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: ['products'] }),
                qc.invalidateQueries({ queryKey: ['categories'] }),
                qc.invalidateQueries({ queryKey: ['product', id] }),
            ]);
        },
    });
    return { deleteProductById, isPending, isSuccess };
};

export const useFeaturedProducts = (limit = 4) => {
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

export const useNewProductDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);
    return { isOpen, open, close };
};

export const useProductById = (id: string) => {
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

/**
 * Trae el stock actual de un conjunto de productos (p. ej. las líneas de una
 * orden) en paralelo. Usa la misma queryKey que `useProductById` para
 * compartir caché y evitar refetches duplicados.
 */
export const useProductsStock = (productIds: (string | null | undefined)[]) => {
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
