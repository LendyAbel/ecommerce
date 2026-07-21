import {
    infiniteQueryOptions,
    keepPreviousData,
    mutationOptions,
    queryOptions,
} from '@tanstack/react-query';

import { categoryKeys } from '@/features/categories/api/categories.queries';
import { logger } from '@/lib/logger';
import { queryClient } from '@/lib/queryClient';

import type { ProductForm } from '../schemas/productZodSchema';
import type { ProductFilters } from './products.service';
import productsService from './products.service';

export const productKeys = {
    all: ['product'] as const,
    list: (filters: ProductFilters) =>
        [...productKeys.all, 'list', filters] as const,
    feature: (limit: number) => [...productKeys.all, 'feature', limit] as const,
    detail: (id: string) => [...productKeys.all, 'detail', id] as const,

    new: () => [...productKeys.all, 'new'] as const,
    delete: () => [...productKeys.all, 'delete'] as const,
};
const PAGE_SIZE = 6;

export const getProductQueryOptions = (filters: ProductFilters) =>
    infiniteQueryOptions({
        queryKey: productKeys.list(filters),
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

export const featureProductQueryOptions = (limit: number) =>
    queryOptions({
        queryKey: productKeys.feature(limit),
        queryFn: () => productsService.getProducts({ limit }),
    });

export const detailProductQueryOptions = (id: string) =>
    queryOptions({
        queryKey: productKeys.detail(id),
        queryFn: () => productsService.getProductById(id),
        enabled: !!id,
    });

export const addNewProductMutationOptions = () =>
    mutationOptions({
        mutationKey: productKeys.new(),
        mutationFn: (newProductData: ProductForm) =>
            productsService.addNewProduct(newProductData),
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: productKeys.all }),
                queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
            ]);
        },
        onError: error => logger.error('Error al crear producto:', error),
    });

export const deleteProductMutationOptions = () =>
    mutationOptions({
        mutationKey: productKeys.delete(),
        mutationFn: (id: string) => productsService.deleteProductById(id),
        onSuccess: async (_data, id) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: productKeys.all }),
                queryClient.invalidateQueries({
                    queryKey: productKeys.detail(id),
                }),
                queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
            ]);
        },
    });
