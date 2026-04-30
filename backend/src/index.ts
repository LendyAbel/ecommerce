import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
    console.log('Server running');
    console.log(`http://localhost:${PORT}`);
    console.log(`API Products: http://localhost:${PORT}/api/products`);
    console.log(`API Categories: http://localhost:${PORT}/api/categories`);
});
