import { apiClient } from '@/lib/api/client';
import type {
    Product,
    ProductForm,
} from '@/features/products/types/productTypes';

export type SortBy = 'price_asc' | 'price_desc' | 'newest' | 'oldest';

export type ProductFilters = {
    search?: string;
    category?: string;
    sortBy?: SortBy;
    page?: number;
    limit?: number;
};

export type PaginatedProducts = {
    data: Product[];
    total: number;
    page: number;
    limit: number;
};

const getProducts = async (
    filters: ProductFilters = {},
): Promise<PaginatedProducts> => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.page) params.page = String(filters.page);
    if (filters.limit) params.limit = String(filters.limit);
    const res = await apiClient.get('/products', { params });
    return res.data;
};

const getProductById = async (id: string): Promise<Product> => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data;
};

const addNewProduct = async (product: ProductForm): Promise<Product> => {
    const res = await apiClient.post('/products', product);
    return res.data;
};

const deleteProductById = async (id: string): Promise<Product> => {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
};

export default {
    getProducts,
    getProductById,
    addNewProduct,
    deleteProductById,
};
