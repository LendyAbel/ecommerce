import axios from 'axios';
import type { Product, ProductForm } from '../types/productTypes';

const api = axios.create({
    baseURL: '/api/products',
    withCredentials: true,
});

const getProducts = async (): Promise<Product[]> => {
    const res = await api.get('/');
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
