import axios from 'axios';
import type { Product, ProductForm } from '../types/productTypes';

const API_URL = '/api/products';

const getProducts = async (): Promise<Product[]> => {
    try {
        const res = await axios.get(API_URL);
        return res.data;
    } catch (error) {
        console.log('Error fetching products: ', error);
        throw error;
    }
};

const getProductById = async (id: string): Promise<Product> => {
    try {
        const res = await axios.get(`${API_URL}/${id}`);
        return res.data;
    } catch (error) {
        console.log('Error fetching products: ', error);
        throw error;
    }
};

const addNewProduct = async (product: ProductForm): Promise<Product> => {
    try {
        const res = await axios.post(API_URL, product);
        return res.data;
    } catch (error) {
        console.log('Error adding new products: ', error);
        if (axios.isAxiosError(error)) {
            console.log(error.response?.data);
        }
        throw error;
    }
};

export default { getProducts, getProductById, addNewProduct };
