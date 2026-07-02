import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import productsService, {
    type ProductFilters,
} from '@/features/products/api/products.service';

const PAGE_SIZE = 6;

export const PRODUCT_KEY = ['products']

/**
 * Listado de productos con scroll infinito. Cada página pide `PAGE_SIZE` items;
 * `getNextPageParam` calcula si quedan más comparando lo ya cargado con `total`.
 */
const useProducts = (filters: ProductFilters = {}) => {
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
export default useProducts;
