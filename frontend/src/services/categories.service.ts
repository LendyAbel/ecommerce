import axios from 'axios';
import type { Category } from '../types/categoryTypes';

const API_URL = '/api/categories';

const getCategories = async (): Promise<Category[]> => {
    try {
        const res = await axios.get(API_URL);
        return res.data;
    } catch (error) {
        console.log('Error fetching categories: ', error);
        throw error;
    }
};

export default { getCategories };
