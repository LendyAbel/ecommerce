import axios from 'axios';
import type { Product, ProductForm } from '../types/productTypes';

const api = axios.create({
    baseURL: '/api/products',
    withCredentials: true,
});

export type SortBy = 'price_asc' | 'price_desc' | 'newest' | 'oldest';

export type ProductFilters = {
    search?: string;
    category?: string;
    sortBy?: SortBy;
};

const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    const res = await api.get('/', { params });
    return res.data;
};

const getProductById = async (id: string): Promise<Product> => {
    const res = await api.get(`/${id}`);
    return res.data;
};

const addNewProduct = async (product: ProductForm): Promise<Product> => {
    const res = await api.post('/', product);
    return res.data;
};

const deleteProductById = async (id: string): Promise<Product> => {
    const res = await api.delete(`/${id}`);
    return res.data;
};

export default {
    getProducts,
    getProductById,
    addNewProduct,
    deleteProductById,
};
