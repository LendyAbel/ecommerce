import { queryOptions } from '@tanstack/react-query';

import categoriesService from './categories.service';

export const categoryKeys = {
    all: ['categories'] as const,
};

export const getCategoriesQueryOptions = () =>
    queryOptions({
        queryKey: categoryKeys.all,
        queryFn: categoriesService.getCategories,
    });
