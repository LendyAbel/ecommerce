import { apiClient } from '@/lib/api/client';

import type { Category } from '../schemas/categoryZodSchema';

const getCategories = async (): Promise<Category[]> => {
    const res = await apiClient.get('/categories');
    return res.data;
};

export default { getCategories };
