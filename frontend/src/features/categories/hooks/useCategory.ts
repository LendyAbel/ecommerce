import { useQuery } from '@tanstack/react-query';
import categoriesService from '@/features/categories/api/categories.service';

const useCategory = () => {
    const {
        data,
        isLoading: isCategoriesLoading,
        isError: isCategoriesError,
    } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesService.getCategories,
    });

    const categories = data ?? [];

    return { categories, isCategoriesLoading, isCategoriesError };
};
export default useCategory;
