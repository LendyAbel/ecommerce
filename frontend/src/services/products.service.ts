import axios from 'axios';

const API_URL = 'api/products';

const getProducts = async () => {
    try {
        const res = await axios.get(API_URL);
        return res.data;
    } catch (error) {
        console.log('Error fetching products: ', error);
        throw error;
    }
};

export default { getProducts}
