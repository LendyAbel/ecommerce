import axios from 'axios';
import type { Product } from '../types/productTypes';

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

export default { getProducts, getProductById };
