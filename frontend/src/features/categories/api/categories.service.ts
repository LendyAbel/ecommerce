import type { Category } from '@/features/categories/schemas/categorySchema';
import { apiClient } from '@/lib/api/client';

const getCategories = async (): Promise<Category[]> => {
    const res = await apiClient.get('/categories');
    return res.data;
};

export default { getCategories };
