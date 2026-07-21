import { useQuery } from '@tanstack/react-query';

import { getCategoriesQueryOptions } from '../api/categories.queries';

const useCategory = () => {
    const query = useQuery(getCategoriesQueryOptions());

    const categories = query.data ?? [];

    return {
        categories,
        isCategoriesLoading: query.isLoading,
        isCategoriesError: query.isError,
    };
};
export default useCategory;
