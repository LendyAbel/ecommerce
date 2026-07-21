import {
    type PaginatedProducts,
    PaginatedProductsSchema,
    type Product,
    type ProductFilters,
    type ProductForm,
    ProductSchema,
} from '@/features/products/schemas/productSchema';
import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/validateResponse';

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
    return validateResponse(PaginatedProductsSchema, res.data, 'GET /products');
};

const getProductById = async (id: string): Promise<Product> => {
    const res = await apiClient.get(`/products/${id}`);
    return validateResponse(ProductSchema, res.data, `GET /products/${id}`);
};

const addNewProduct = async (product: ProductForm): Promise<Product> => {
    const res = await apiClient.post('/products', product);
    return validateResponse(ProductSchema, res.data, 'POST /products/');
};

const deleteProductById = async (id: string): Promise<Product> => {
    const res = await apiClient.delete(`/products/${id}`);
    return validateResponse(ProductSchema, res.data, `DELETE /products/${id}`);
};

export default {
    getProducts,
    getProductById,
    addNewProduct,
    deleteProductById,
};
