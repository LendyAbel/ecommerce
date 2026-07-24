import { useQuery } from '@tanstack/react-query';

import { getCategoriesQueryOptions } from '@/features/categories/api/categories.queries';

export const useCategories = () => {
    const query = useQuery(getCategoriesQueryOptions());

    const categories = query.data ?? [];

    return {
        categories,
        isLoading: query.isLoading,
        isError: query.isError,
    };
};